from services.cleaning_service import get_stage_metrics


def _safe_rate(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)


def _build_pipeline_payload(df):
    metrics = get_stage_metrics(df)
    applications = int(metrics["applications"].sum()) if not metrics.empty else 0
    callbacks = int(metrics["callbacks"].sum()) if not metrics.empty else 0
    interviews = int(metrics["interviews"].sum()) if not metrics.empty else 0
    offers = int(metrics["offers"].sum()) if not metrics.empty else 0

    by_role = {}
    if not df.empty and "job_role" in df.columns:
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
    if "job_applications" not in all_data:
        return None

    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "job_role" not in job_applications.columns:
        return None

    role_df = job_applications[job_applications["job_role"].astype("string").str.lower() == role.lower()]
    if role_df.empty:
        return None

    payload = _build_pipeline_payload(role_df)
    payload["role"] = role
    payload.pop("by_role", None)
    return payload