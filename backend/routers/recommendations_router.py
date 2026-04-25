"""Recommendations router for personalised F5 guidance.

This router receives a user profile and optional resume, delegates to the
personalization and LLM services, and returns structured job-search insights.
"""

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import json
import logging
from models.data_models import UserProfile, RecommendationResponse
from services.personalization_service import (
    get_user_metrics,
    get_benchmark_metrics,
    get_predicted_outcomes,
    compute_role_conversion_analysis,
    compute_timing_analysis,
)
from services.resume_service import parse_resume_pdf, validate_resume_file
from services.llm_service import generate_recommendations

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze")
async def analyze_recommendations(
    profile_json: str = Form(...),
    resume: UploadFile = File(None),
):
    """
    Analyze user profile and generate personalized recommendations.

    Request:
        profile_json: JSON string of UserProfile
        resume: Optional PDF file

    Response:
        {
            user_metrics: {...},
            benchmark_metrics: {...},
            predicted_outcomes: {...},
            llm_insights: {...}
        }
    """
    try:
        # Parse user profile
        profile_dict = json.loads(profile_json)
        user_profile = UserProfile(**profile_dict)

        logger.info(f"Processing profile for role: {user_profile.targetRole}")

        # Parse resume if provided
        resume_data = None
        if resume:
            content = await resume.read()
            file_size = len(content)
            
            is_valid, error_msg = validate_resume_file(file_size)
            if not is_valid:
                logger.warning(f"Resume validation failed: {error_msg}")
            else:
                resume_data = parse_resume_pdf(content)
                logger.info(f"Resume parsed: {len(resume_data.get('skills', []))} skills extracted")

        # Compute user metrics
        user_metrics = get_user_metrics(user_profile)
        logger.info(f"User metrics computed: {user_metrics.get('applications', 0)} applications")

        # Compute benchmarks
        benchmark_metrics = get_benchmark_metrics(user_profile)
        logger.info(f"Benchmarks computed: {benchmark_metrics.avg_offer_rate:.0%} offer rate")

        # Compute predicted outcomes
        predicted_outcomes = get_predicted_outcomes(
            user_profile, user_metrics, benchmark_metrics, resume_data
        )
        logger.info(f"Predicted outcomes: {predicted_outcomes.offers} projected offers")

        # Get role and timing analysis for LLM context
        role_analysis = compute_role_conversion_analysis(user_profile)
        timing_analysis = compute_timing_analysis()

        # Generate LLM insights
        llm_response = generate_recommendations(
            user_profile.dict(),
            user_metrics,
            benchmark_metrics.dict(),
            predicted_outcomes.dict(),
            role_analysis,
            timing_analysis,
        )

        llm_insights = llm_response.get("llm_insights", {})

        # Build response
        response = {
            "user_metrics": user_metrics,
            "benchmark_metrics": benchmark_metrics.dict(),
            "predicted_outcomes": predicted_outcomes.dict(),
            "role_analysis": role_analysis,
            "timing_analysis": timing_analysis,
            "llm_insights": llm_insights,
            "metadata": {
                "source": llm_response.get("source", "unknown"),
                "model": llm_response.get("model", "unknown"),
                "resume_parsed": resume_data is not None,
            },
        }

        logger.info("Recommendations generated successfully")
        return response

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid profile JSON format"},
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return JSONResponse(
            status_code=400,
            content={"error": f"Profile validation error: {str(e)}"},
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to generate recommendations: {str(e)}"},
        )
