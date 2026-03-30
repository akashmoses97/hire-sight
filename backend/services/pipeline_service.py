"""Pipeline analytics service.

This module aggregates application-stage metrics, computes conversion rates,
and prepares filter options and summary payloads for pipeline visualizations.
"""

from services.cleaning_service import get_stage_metrics

def _safe_rate(numerator: int, denominator: int) -> float:
    """Compute a rounded conversion rate with zero-denominator protection.

    Returning ``0.0`` for empty denominators keeps the frontend payload stable
    and avoids exceptions when a filtered dataset has no rows in a stage.
    """
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)

def _build_pipeline_payload(df):
    """Build the standard pipeline response payload from application rows.

    The payload includes overall stage totals, stage-to-stage conversion
    rates, and a per-role breakdown used by the dashboard and filter views.
    """
    metrics = get_stage_metrics(df)
    applications = int(metrics["applications"].sum()) if not metrics.empty else 0
    callbacks = int(metrics["callbacks"].sum()) if not metrics.empty else 0
    interviews = int(metrics["interviews"].sum()) if not metrics.empty else 0
    offers = int(metrics["offers"].sum()) if not metrics.empty else 0

    by_role = {}
    if not df.empty and "job_role" in df.columns:
        # Keep a role-level breakdown so the frontend can show detailed stage
        # counts alongside the aggregate pipeline totals.
        for role, role_df in df.groupby("job_role"):
            role_metrics = get_stage_metrics(role_df)
            by_role[role] = {
                "applications": int(role_metrics["applications"].sum()),
                "callbacks": int(role_metrics["callbacks"].sum()),
                "interviews": int(role_metrics["interviews"].sum()),
                "offers": int(role_metrics["offers"].sum()),
            }

    return {
        "applications": applications,
        "callbacks": callbacks,
        "interviews": interviews,
        "offers": offers,
        "conversion_rates": {
            "app_to_callback": _safe_rate(callbacks, applications),
            "callback_to_interview": _safe_rate(interviews, callbacks),
            "interview_to_offer": _safe_rate(offers, interviews),
        },
        "by_role": by_role,
    }

def process_pipeline_data(all_data):
    """Return pipeline metrics for the full job applications dataset.

    If the dataset is missing or empty, the function returns either ``None``
    or an empty-state payload that preserves the response schema.
    """
    if "job_applications" not in all_data:
        return None

    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty:
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
            "by_role": {},
        }

    return _build_pipeline_payload(job_applications)

def get_pipeline_by_role(all_data, role):
    """Return pipeline metrics scoped to one normalized role string.

    Matching is case-insensitive and the response includes the requested role
    even when no records are found so the caller can preserve context.
    """
    if "job_applications" not in all_data:
        return None

    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "job_role" not in job_applications.columns:
        return None

    role_df = job_applications[job_applications["job_role"].astype("string").str.lower() == role.lower()]
    if role_df.empty:
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
            "by_role": {},
            "role": role,
        }

    payload = _build_pipeline_payload(role_df)
    payload["role"] = role
    payload.pop("by_role", None)
    return payload

def get_pipeline_by_filters(all_data, filters):
    """Return pipeline metrics after applying supported filter dimensions.

    Filters are matched case-insensitively against columns present in the
    applications dataset, and an empty filtered result produces a valid
    zeroed payload instead of failing.
    """
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "job_role" not in job_applications.columns:
        return None

    df = job_applications.copy()
    # Apply only known columns so the endpoint can safely receive partial
    # filter sets from the frontend.
    for key, value in filters.items():
        if value and value != 'All' and key in df.columns:
            df = df[df[key].astype("string").str.lower() == value.lower()]

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
            "by_role": {},
        }

    return _build_pipeline_payload(df)

def get_all_companies(all_data):
    """Return sorted unique company names from the applications dataset.

    Blank values are removed so the frontend dropdown only shows meaningful
    company options for pipeline filtering.
    """
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "company_name" not in job_applications.columns:
        return []

    companies = job_applications["company_name"].dropna().astype("string").str.strip()
    return sorted(companies[companies != ""].unique().tolist())

def get_all_job_types(all_data):
    """Return sorted unique job types from the applications dataset.

    The function strips whitespace and removes empty values before building
    the filter list sent to the frontend.
    """
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "job_type" not in job_applications.columns:
        return []

    job_types = job_applications["job_type"].dropna().astype("string").str.strip()
    return sorted(job_types[job_types != ""].unique().tolist())

def get_all_platforms(all_data):
    """Return sorted unique application platforms from the dataset.

    These values back the platform dropdown used on the pipeline page.
    """
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "platform" not in job_applications.columns:
        return []

    platforms = job_applications["platform"].dropna().astype("string").str.strip()
    return sorted(platforms[platforms != ""].unique().tolist())

def get_all_roles(all_data):
    """Return sorted unique job roles from the applications dataset.

    Roles are cleaned with whitespace trimming and blank removal before the
    frontend receives them as pipeline filter options.
    """
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "job_role" not in job_applications.columns:
        return []

    roles = job_applications["job_role"].dropna().astype("string").str.strip()
    return sorted(roles[roles != ""].unique().tolist())
