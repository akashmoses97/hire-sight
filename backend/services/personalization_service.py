"""
personalization_service.py

Service for computing personalized metrics and benchmarks for recommendations.
"""

from typing import Dict, Optional
import math
import pandas as pd
from models.data_models import UserProfile, BenchmarkMetrics, PredictedOutcomes
from data_store import all_data


def _to_non_negative_int(value, default=None):
    if value is None or value == "":
        return default
    try:
        parsed = int(value)
        return max(parsed, 0)
    except (TypeError, ValueError):
        return default


def get_user_metrics(user_profile: UserProfile) -> Dict:
    """
    Compute user's pipeline metrics filtered by target role and job type.

    Args:
        user_profile: UserProfile object with filters

    Returns:
        dict with user's filtered pipeline metrics
    """
    try:
        # Prefer self-reported counts when the user provides all four stage values.
        self_apps = _to_non_negative_int(user_profile.currentApplications)
        self_callbacks = _to_non_negative_int(user_profile.currentCallbacks)
        self_interviews = _to_non_negative_int(user_profile.currentInterviews)
        self_offers = _to_non_negative_int(user_profile.currentOffers)

        has_full_self_report = all(
            value is not None for value in [self_apps, self_callbacks, self_interviews, self_offers]
        )

        if has_full_self_report:
            apps = self_apps
            callbacks = min(self_callbacks, apps)
            interviews = min(self_interviews, callbacks)
            offers = min(self_offers, interviews)

            app_to_callback = callbacks / apps if apps > 0 else 0.0
            callback_to_interview = interviews / callbacks if callbacks > 0 else 0.0
            interview_to_offer = offers / interviews if interviews > 0 else 0.0

            return {
                "applications": apps,
                "callbacks": callbacks,
                "interviews": interviews,
                "offers": offers,
                "conversion_rates": {
                    "app_to_callback": round(app_to_callback, 3),
                    "callback_to_interview": round(callback_to_interview, 3),
                    "interview_to_offer": round(interview_to_offer, 3),
                },
                "source": "self_reported",
            }

        df = all_data.get("job_applications", pd.DataFrame())

        if df.empty:
            return {
                "applications": 0,
                "callbacks": 0,
                "interviews": 0,
                "offers": 0,
                "conversion_rates": {
                    "app_to_callback": 0.0,
                    "callback_to_interview": 0.0,
                    "interview_to_offer": 0.0,
                },
            }

        # Filter by target role
        filtered = df[df.get("job_role", "").str.contains(user_profile.targetRole, case=False, na=False)]

        # Filter by job type
        if user_profile.jobType and user_profile.jobType != "All":
            filtered = filtered[
                filtered.get("job_type", "").str.contains(user_profile.jobType, case=False, na=False)
            ]

        # Calculate stage counts
        applications = len(filtered)
        callbacks = len(filtered[filtered.get("status", "").isin(["Assessment Pending", "Phone Screen", "Interview Scheduled", "Selected", "Rejected"])])
        interviews = len(filtered[filtered.get("status", "").isin(["Interview Scheduled", "Selected"])])
        offers = len(filtered[filtered.get("status", "") == "Selected"])

        # Calculate conversion rates
        app_to_callback = callbacks / applications if applications > 0 else 0.0
        callback_to_interview = interviews / callbacks if callbacks > 0 else 0.0
        interview_to_offer = offers / interviews if interviews > 0 else 0.0

        return {
            "applications": applications,
            "callbacks": callbacks,
            "interviews": interviews,
            "offers": offers,
            "conversion_rates": {
                "app_to_callback": round(app_to_callback, 3),
                "callback_to_interview": round(callback_to_interview, 3),
                "interview_to_offer": round(interview_to_offer, 3),
            },
            "total_records": len(df),
            "filtered_records": len(filtered),
            "source": "dataset_baseline",
        }

    except Exception as e:
        print(f"Error computing user metrics: {e}")
        return {
            "applications": 0,
            "callbacks": 0,
            "interviews": 0,
            "offers": 0,
            "conversion_rates": {
                "app_to_callback": 0.0,
                "callback_to_interview": 0.0,
                "interview_to_offer": 0.0,
            },
        }


def get_benchmark_metrics(user_profile: UserProfile) -> BenchmarkMetrics:
    """
    Compute market benchmarks for the user's target role and experience level.

    Args:
        user_profile: UserProfile object with role and experience level

    Returns:
        BenchmarkMetrics with market averages
    """
    try:
        df = all_data.get("job_applications", pd.DataFrame())

        if df.empty:
            return BenchmarkMetrics(avg_offer_rate=0.15)

        # Get data for the same role (market-wide)
        role_data = df[df.get("job_role", "").str.contains(user_profile.targetRole, case=False, na=False)]

        if role_data.empty:
            # Fallback: use overall market averages
            role_data = df

        applications = len(role_data)
        offers = len(role_data[role_data.get("status", "") == "Selected"])
        callbacks = len(
            role_data[
                role_data.get("status", "").isin(
                    ["Assessment Pending", "Phone Screen", "Interview Scheduled", "Selected", "Rejected"]
                )
            ]
        )

        avg_offer_rate = (offers / applications) if applications > 0 else 0.25
        avg_callback_rate = (callbacks / applications) if applications > 0 else 0.40
        
        # Safe interview calculation
        interviews = len(role_data[role_data.get("status", "").isin(["Interview Scheduled", "Selected"])])
        avg_interview_rate = (interviews / callbacks) if callbacks > 0 else 0.50

        return BenchmarkMetrics(
            avg_offer_rate=round(avg_offer_rate, 3),
            avg_callback_rate=round(avg_callback_rate, 3),
            avg_interview_rate=round(avg_interview_rate, 3),
            median_time_to_callback_days=7,
            median_time_to_offer_days=21,
        )

    except Exception as e:
        print(f"Error computing benchmark metrics: {e}")
        return BenchmarkMetrics(avg_offer_rate=0.25, avg_callback_rate=0.40, avg_interview_rate=0.50)


def get_predicted_outcomes(
    user_profile: UserProfile,
    user_metrics: Dict,
    benchmark_metrics: BenchmarkMetrics,
    resume_data: Optional[Dict] = None,
) -> PredictedOutcomes:
    """
    Simulate predicted outcomes if user follows recommendations.

    Uses benchmarks and user's current trajectory to estimate improvements.
    """
    try:
        rates = user_metrics.get("conversion_rates", {})
        current_app_to_callback = rates.get("app_to_callback", 0.0)
        current_callback_to_interview = rates.get("callback_to_interview", 0.0)
        current_interview_to_offer = rates.get("interview_to_offer", 0.0)

        # Account for international/visa constraints when user prioritizes sponsorship.
        goals = [g.lower() for g in (user_profile.goals or [])]
        has_visa_constraint = "visa_sponsorship" in goals

        # Application volume growth should be conservative and realistic.
        base_growth = 1.20
        if "quick_placement" in goals:
            base_growth = 1.30
        if user_metrics.get("applications", 0) >= 500:
            base_growth = min(base_growth, 1.15)

        current_apps = max(user_metrics.get("applications", 1), 1)
        predicted_apps = int(round(current_apps * base_growth))

        # Stage-rate uplift model: improve user rates modestly, capped by realistic limits.
        callback_cap = min(benchmark_metrics.avg_callback_rate * 0.25, 0.12)
        interview_cap = min(benchmark_metrics.avg_interview_rate * 0.9, 0.60)
        offer_cap = 0.35

        if has_visa_constraint:
            callback_cap *= 0.7
            interview_cap *= 0.85
            offer_cap *= 0.8

        target_app_to_callback = min(
            max(current_app_to_callback * 1.20, current_app_to_callback + 0.001),
            callback_cap,
        )
        target_callback_to_interview = min(
            max(current_callback_to_interview * 1.12, current_callback_to_interview + 0.02),
            interview_cap,
        )

        # If current interview->offer is zero, use a modest floor instead of exploding to benchmark.
        if current_interview_to_offer <= 0:
            floor_offer_rate = 0.08
            if has_visa_constraint:
                floor_offer_rate = 0.06
            target_interview_to_offer = min(floor_offer_rate, offer_cap)
        else:
            target_interview_to_offer = min(
                max(current_interview_to_offer * 1.10, current_interview_to_offer + 0.01),
                offer_cap,
            )

        predicted_callbacks = int(round(predicted_apps * target_app_to_callback))
        predicted_interviews = int(round(predicted_callbacks * target_callback_to_interview))
        predicted_offers = int(round(predicted_interviews * target_interview_to_offer))

        extension_note = None

        # If baseline has no offers yet, extend projection horizon only within realistic cap.
        if user_metrics.get("offers", 0) <= 0 and predicted_offers < 1:
            offer_per_application = (
                target_app_to_callback
                * target_callback_to_interview
                * target_interview_to_offer
            )
            if offer_per_application > 0:
                required_apps_for_one_offer = math.ceil(1.0 / offer_per_application)
                # Realism cap: do not project absurd application volume in one scenario.
                max_projection_apps = max(
                    int(round(current_apps * 2.5)),
                    2500,
                )

                if required_apps_for_one_offer <= max_projection_apps:
                    predicted_apps = max(predicted_apps, required_apps_for_one_offer)
                    extension_note = "Projection horizon was extended to the estimated volume needed for one offer."
                else:
                    predicted_apps = max(predicted_apps, max_projection_apps)
                    extension_note = (
                        f"One-offer target would require about {required_apps_for_one_offer:,} applications; "
                        f"projection was capped at {max_projection_apps:,} for realism."
                    )

                predicted_callbacks = int(round(predicted_apps * target_app_to_callback))
                predicted_interviews = int(round(predicted_callbacks * target_callback_to_interview))
                predicted_offers = int(round(predicted_interviews * target_interview_to_offer))

                # Guarantee at least one offer only when target is reachable inside realism cap.
                if (
                    required_apps_for_one_offer <= max_projection_apps
                    and predicted_interviews > 0
                    and predicted_offers < 1
                ):
                    predicted_offers = 1

        # Enforce non-increasing pipeline counts.
        predicted_callbacks = min(predicted_callbacks, predicted_apps)
        predicted_interviews = min(predicted_interviews, predicted_callbacks)
        predicted_offers = min(predicted_offers, predicted_interviews)

        predicted_rate = (
            predicted_offers / predicted_interviews if predicted_interviews > 0 else 0.0
        )

        reasoning = (
            f"Prediction uses your current pipeline as baseline with conservative stage-wise uplift "
            f"and market caps for {user_profile.targetRole}. "
            f"Estimated conversion shifts: app→callback {current_app_to_callback:.1%}→{target_app_to_callback:.1%}, "
            f"callback→interview {current_callback_to_interview:.1%}→{target_callback_to_interview:.1%}, "
            f"interview→offer {current_interview_to_offer:.1%}→{target_interview_to_offer:.1%}."
        )
        if has_visa_constraint:
            reasoning += " Visa sponsorship constraints were applied as a damping factor on projected conversion rates."
        if extension_note:
            reasoning += f" {extension_note}"

        return PredictedOutcomes(
            applications=max(predicted_apps, 1),
            callbacks=max(predicted_callbacks, 0),
            interviews=max(predicted_interviews, 0),
            offers=max(predicted_offers, 0),
            offer_rate=round(predicted_rate, 3),
            reasoning=reasoning,
        )

    except Exception as e:
        print(f"Error computing predicted outcomes: {e}")
        # Fallback: conservative 1.2x improvement
        return PredictedOutcomes(
            applications=int(max(user_metrics.get("applications", 1), 1) * 1.2),
            callbacks=int(max(user_metrics.get("callbacks", 0), 0) * 1.2),
            interviews=int(max(user_metrics.get("interviews", 0), 0) * 1.2),
            offers=int(max(user_metrics.get("offers", 0), 0) * 1.5),
            offer_rate=round(benchmark_metrics.avg_offer_rate * 1.2, 3),
            reasoning="Conservative estimate based on market data.",
        )


def compute_role_conversion_analysis(user_profile: UserProfile) -> Dict:
    """
    Analyze conversion rates across different roles for role selection advice.

    Returns dict with top performing roles and their metrics.
    """
    try:
        df = all_data.get("job_applications", pd.DataFrame())

        role_stats = []

        if not df.empty and "job_role" in df.columns:
            # Group by role and compute offer rates from application tracker dataset.
            for role in df["job_role"].dropna().unique():
                role_data = df[df["job_role"] == role]
                total = len(role_data)
                offers = len(role_data[role_data.get("status", "") == "Selected"])
                offer_rate = (offers / total) if total > 0 else 0.0

                if total >= 3:
                    role_stats.append(
                        {
                            "role": role,
                            "offer_rate": offer_rate,
                            "applications": total,
                            "offers": offers,
                            "source": "job_applications",
                        }
                    )

        # Fallback to recruitment dataset when tracker data is sparse.
        if len(role_stats) == 0:
            ai_df = all_data.get("ai_recruitment", pd.DataFrame())
            if not ai_df.empty and "role" in ai_df.columns:
                decision_col = "decision_standardized" if "decision_standardized" in ai_df.columns else "decision"
                for role in ai_df["role"].dropna().unique():
                    role_data = ai_df[ai_df["role"] == role]
                    total = len(role_data)
                    offers = len(role_data[role_data.get(decision_col, "") == "Selected"])
                    offer_rate = (offers / total) if total > 0 else 0.0

                    if total >= 3:
                        role_stats.append(
                            {
                                "role": role,
                                "offer_rate": offer_rate,
                                "applications": total,
                                "offers": offers,
                                "source": "ai_recruitment",
                            }
                        )

        role_stats.sort(key=lambda x: (x["offer_rate"], x["applications"]), reverse=True)

        return {
            "top_roles": role_stats[:5],
            "lowest_roles": role_stats[-3:] if len(role_stats) > 3 else [],
        }

    except Exception as e:
        print(f"Error analyzing role conversion: {e}")
        return {"top_roles": [], "lowest_roles": []}


def compute_timing_analysis() -> Dict:
    """
    Analyze when applications have highest conversion rates (by month/season).

    Returns dict with peak application months and offer rates.
    """
    try:
        df = all_data.get("job_applications", pd.DataFrame())

        if df.empty or "application_date" not in df.columns:
            return {
                "peak_months": [],
                "slow_months": [],
                "all_months": [],
                "monthly_application_volume": [],
                "coverage_month_count": 0,
                "has_year_round_trend": False,
            }

        cleaned = df.copy()
        cleaned["application_date"] = pd.to_datetime(cleaned["application_date"], errors="coerce")
        cleaned = cleaned.dropna(subset=["application_date"]) 

        if cleaned.empty:
            return {
                "peak_months": [],
                "slow_months": [],
                "all_months": [],
                "monthly_application_volume": [],
                "coverage_month_count": 0,
                "has_year_round_trend": False,
            }

        cleaned["month"] = cleaned["application_date"].dt.month
        cleaned["year"] = cleaned["application_date"].dt.year
        cleaned["year_month"] = cleaned["application_date"].dt.to_period("M").astype(str)

        month_stats = []
        for month in range(1, 13):
            month_data = cleaned[cleaned["month"] == month]
            if len(month_data) > 0:
                total = len(month_data)
                offers = len(month_data[month_data.get("status", "") == "Selected"])
                offer_rate = (offers / total) if total > 0 else 0.0

                month_name = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ][month - 1]

                month_stats.append(
                    {
                        "month": month_name,
                        "month_num": month,
                        "offer_rate": offer_rate,
                        "applications": total,
                    }
                )

        monthly_volume = (
            cleaned.groupby(["year", "year_month"], as_index=False)
            .size()
            .rename(columns={"size": "applications"})
            .sort_values(["year", "year_month"])
        )

        high_months = sorted(month_stats, key=lambda x: (x["offer_rate"], x["applications"]), reverse=True)[:3]
        low_months = sorted(month_stats, key=lambda x: (x["offer_rate"], x["applications"]))[:2]
        coverage_month_count = int(cleaned["month"].nunique())
        has_year_round_trend = coverage_month_count == 12

        return {
            "peak_months": high_months,
            "slow_months": low_months,
            "all_months": sorted(month_stats, key=lambda x: x["month_num"]),
            "monthly_application_volume": monthly_volume.to_dict(orient="records"),
            "coverage_month_count": coverage_month_count,
            "has_year_round_trend": has_year_round_trend,
        }

    except Exception as e:
        print(f"Error analyzing timing: {e}")
        return {
            "peak_months": [],
            "slow_months": [],
            "all_months": [],
            "monthly_application_volume": [],
            "coverage_month_count": 0,
            "has_year_round_trend": False,
        }
