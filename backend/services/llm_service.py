"""LLM-powered recommendations service.

This module calls the Hugging Face Inference API (Mistral-7B by default) to generate
personalised job search guidance. Falls back to data-driven advice when the API key
is absent or all model endpoints fail.
"""

import os
import json
import requests
from typing import Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_recommendations(
    user_profile: Dict,
    user_metrics: Dict,
    benchmark_metrics: Dict,
    predicted_outcomes: Dict,
    role_analysis: Optional[Dict] = None,
    timing_analysis: Optional[Dict] = None,
) -> Dict:
    """
    Generate personalized recommendations using Hugging Face API.

    Falls back to data-driven recommendations if API is unavailable.
    """
    try:
        hf_api_key = os.getenv("HF_API_KEY")
        hf_model = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.1")

        if not hf_api_key:
            logger.warning("HF_API_KEY not set, using fallback recommendations")
            return generate_fallback_recommendations(
                user_profile, user_metrics, benchmark_metrics, predicted_outcomes
            )

        # Construct prompt
        prompt = _build_recommendation_prompt(
            user_profile, user_metrics, benchmark_metrics, predicted_outcomes,
            role_analysis, timing_analysis
        )

        # Call Hugging Face API
        response = _call_huggingface_api(hf_api_key, hf_model, prompt)

        if response and "llm_insights" in response:
            return response

        # If parsing fails, use fallback
        logger.warning("Failed to parse LLM response, using fallback")
        return generate_fallback_recommendations(
            user_profile, user_metrics, benchmark_metrics, predicted_outcomes
        )

    except Exception as e:
        logger.error(f"Error in LLM service: {e}")
        return generate_fallback_recommendations(
            user_profile, user_metrics, benchmark_metrics, predicted_outcomes
        )


def _build_recommendation_prompt(
    user_profile: Dict,
    user_metrics: Dict,
    benchmark_metrics: Dict,
    predicted_outcomes: Dict,
    role_analysis: Optional[Dict] = None,
    timing_analysis: Optional[Dict] = None,
) -> str:
    """
    Build the prompt to send to Hugging Face model.
    """
    current_offer_rate = (
        (user_metrics.get("offers", 0) / max(user_metrics.get("applications", 1), 1)) * 100
    )
    benchmark_offer_rate = benchmark_metrics.get("avg_offer_rate", 0.25) * 100
    predicted_offer_rate = (
        (predicted_outcomes.get("offers", 0) / max(predicted_outcomes.get("applications", 1), 1)) * 100
    )

    top_role = ""
    if role_analysis and role_analysis.get("top_roles"):
        top_role = f"\nTop performing role: {role_analysis['top_roles'][0]['role']} ({role_analysis['top_roles'][0]['offer_rate']*100:.0f}% offer rate)"

    peak_month = ""
    if timing_analysis and timing_analysis.get("peak_months"):
        peak_month = f"\nPeak hiring months: {', '.join([m['month'] for m in timing_analysis['peak_months']])}"

    prompt = f"""You are a job search analytics advisor with expertise in hiring trends and career development.

USER PROFILE:
- Target Role: {user_profile.get('targetRole', 'Not specified')}
- Experience Level: {user_profile.get('experienceLevel', 'mid')}
- Job Type Preference: {user_profile.get('jobType', 'Any')}
- Goals: {', '.join(user_profile.get('goals', ['Placement']))}
- Industry Focus: {user_profile.get('industryFocus', 'Any')}

CURRENT METRICS:
- Applications: {user_metrics.get('applications', 0)}
- Callbacks: {user_metrics.get('callbacks', 0)}
- Interviews: {user_metrics.get('interviews', 0)}
- Offers: {user_metrics.get('offers', 0)}
- Current Offer Rate: {current_offer_rate:.1f}%

MARKET BENCHMARKS:
- Market Offer Rate for {user_profile.get('targetRole', 'similar roles')}: {benchmark_offer_rate:.1f}%
- Market Callback Rate: {benchmark_metrics.get('avg_callback_rate', 0.40)*100:.1f}%
- Market Interview-to-Offer Rate: {benchmark_metrics.get('avg_interview_rate', 0.50)*100:.1f}%{top_role}{peak_month}

PREDICTED OUTCOMES (if recommendations followed):
- Projected Applications: {predicted_outcomes.get('applications', 0)}
- Projected Offers: {predicted_outcomes.get('offers', 0)}
- Projected Offer Rate: {predicted_offer_rate:.1f}%

Based on this data, provide actionable recommendations in the following JSON format ONLY (no markdown, no extra text):
{{
  "role_selection_advice": "Specific advice on which roles to focus on based on conversion rates",
  "timing_strategy": "Advice on when to submit applications (months, seasons) based on hiring patterns",
  "volume_optimization": "How many applications per week, based on current rate and benchmarks",
  "experience_matching": "Analysis of whether user is appropriately matched to target role",
  "industry_focus": "Industries or companies that align with user's goals",
  "confidence_score": 0.85,
  "improvement_summary": "3 key actions: (1) Action 1, (2) Action 2, (3) Action 3"
}}"""

    return prompt


def _call_huggingface_api(api_key: str, model: str, prompt: str) -> Optional[Dict]:
    """
    Call Hugging Face Inference API with retry logic and timeout.

    Returns parsed JSON response or None on failure.
    """
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        result = None
        used_endpoint = None
        used_model = None
        last_error = None

        # Prefer the OpenAI-compatible router endpoint (works with Inference Providers tokens).
        router_url = "https://router.huggingface.co/v1/chat/completions"
        candidate_models = [
            model,
            "meta-llama/Llama-3.1-8B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct",
        ]

        for candidate in candidate_models:
            chat_payload = {
                "model": candidate,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 800,
            }
            try:
                logger.info(f"Calling Hugging Face Router chat API with model {candidate}")
                response = requests.post(router_url, headers=headers, json=chat_payload, timeout=30)
                response.raise_for_status()
                result = response.json()
                used_endpoint = router_url
                used_model = candidate
                break
            except requests.exceptions.RequestException as e:
                body = ""
                if getattr(e, "response", None) is not None:
                    body = (e.response.text or "")[:300]
                last_error = f"{str(e)} | body={body}"
                logger.warning(f"HF router model failed: {candidate} :: {last_error}")

        # Fallback to older text-generation style endpoints if router chat failed.
        if result is None:
            endpoints = [
                f"https://router.huggingface.co/hf-inference/models/{model}",
                f"https://api-inference.huggingface.co/models/{model}",
            ]

            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 800,
                    "temperature": 0.7,
                    "top_p": 0.95,
                },
            }

            for api_url in endpoints:
                try:
                    logger.info(f"Calling Hugging Face API with model {model} via {api_url}")
                    response = requests.post(api_url, headers=headers, json=payload, timeout=30)
                    response.raise_for_status()
                    result = response.json()
                    used_endpoint = api_url
                    used_model = model
                    break
                except requests.exceptions.RequestException as e:
                    body = ""
                    if getattr(e, "response", None) is not None:
                        body = (e.response.text or "")[:300]
                    last_error = f"{str(e)} | body={body}"
                    logger.warning(f"HF endpoint failed: {api_url} :: {last_error}")

        if result is None:
            logger.error(f"All Hugging Face endpoints failed for model {model}. last_error={last_error}")
            return None

        # Extract generated text from router chat response.
        if isinstance(result, dict) and isinstance(result.get("choices"), list) and result.get("choices"):
            generated_text = result["choices"][0].get("message", {}).get("content", "")
        # Extract generated text from text-generation response.
        elif isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get("generated_text", "")
        elif isinstance(result, dict):
            if result.get("error"):
                logger.warning(f"HF returned error payload: {result.get('error')}")
                return None
            generated_text = result.get("generated_text", "")
        else:
            generated_text = str(result)

        # Extract JSON from generated text
        json_match = _extract_json_from_text(generated_text)
        
        if json_match:
            insights = json.loads(json_match)
            
            # Ensure all required keys exist
            insights.setdefault("role_selection_advice", "Focus on high-converting roles")
            insights.setdefault("timing_strategy", "Apply consistently throughout the year")
            insights.setdefault("volume_optimization", "Increase applications strategically")
            insights.setdefault("experience_matching", "Assess experience level alignment")
            insights.setdefault("industry_focus", "Target industries matching your goals")
            insights.setdefault("confidence_score", 0.75)
            insights.setdefault("improvement_summary", "Focus on quality and timing")

            return {
                "llm_insights": insights,
                "source": "huggingface",
                "model": f"{used_model or model} via {'router-chat' if 'v1/chat/completions' in (used_endpoint or '') else ('router' if 'router.huggingface.co' in (used_endpoint or '') else 'legacy-endpoint')}",
            }
        else:
            logger.warning("No JSON found in LLM response")
            return None

    except requests.exceptions.Timeout:
        logger.error("Hugging Face API timeout")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Hugging Face API error: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        return None


def _extract_json_from_text(text: str) -> Optional[str]:
    """
    Extract JSON object from text (handles cases where LLM returns extra text).

    Returns JSON string or None.
    """
    import re
    
    # Try to find JSON object in curly braces
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)
    
    return None


def generate_fallback_recommendations(
    user_profile: Dict,
    user_metrics: Dict,
    benchmark_metrics: Dict,
    predicted_outcomes: Dict,
) -> Dict:
    """
    Generate recommendations based on data when LLM is unavailable.

    Provides sensible defaults based on metrics.
    """
    applications = max(user_metrics.get("applications", 0), 0)
    offers = max(user_metrics.get("offers", 0), 0)
    current_rate = (offers / applications) if applications > 0 else 0.0
    benchmark_rate = benchmark_metrics.get("avg_offer_rate", 0.25)
    
    target_role = user_profile.get("targetRole", "target role")
    
    # Generate data-driven advice
    if current_rate < benchmark_rate:
        role_advice = f"Your offer rate ({current_rate:.0%}) is below market average ({benchmark_rate:.0%}) for {target_role} roles. Focus on: (1) Higher quality applications, (2) Targeted roles aligned with your experience, (3) Thorough interview preparation."
    else:
        role_advice = f"Your offer rate ({current_rate:.0%}) matches market performance. Continue current strategy but look for roles with higher growth demand."

    if user_metrics.get("applications", 0) < 5:
        volume_advice = "Increase application volume to 5-10 per week to improve statistical significance and exposure."
    elif user_metrics.get("applications", 0) < 15:
        volume_advice = "Current volume (2-3 per week) is good. Consider increasing to 4-5 if you're aiming for faster placement."
    else:
        volume_advice = "You're applying frequently. Focus on quality over quantity to avoid burnout."

    timing_advice = "Peak hiring typically occurs in Q1 (Jan-Mar) and mid-year (Jun-Jul). Focus extra applications during these periods."

    experience_advice = f"Your {user_profile.get('experienceLevel', 'mid')} level experience aligns well with {target_role} roles. Emphasize relevant projects in applications."

    industry_advice = f"Based on your goals ({', '.join(user_profile.get('goals', ['Placement']))}), target companies in growth industries like Tech and Fintech."

    improvement = "(1) Increase quality applications in peak hiring months, (2) Tailor resumes for each role, (3) Practice interview questions for your target role"

    return {
        "llm_insights": {
            "role_selection_advice": role_advice,
            "timing_strategy": timing_advice,
            "volume_optimization": volume_advice,
            "experience_matching": experience_advice,
            "industry_focus": industry_advice,
            "confidence_score": 0.65,
            "improvement_summary": improvement,
        },
        "source": "fallback",
        "model": "data-driven",
    }
