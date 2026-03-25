from services.cleaning_service import get_stage_metrics


def _safe_rate(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)


def process_yearly_trends(all_data):
    job_market = all_data.get("job_market")
    if job_market is None or job_market.empty or "year" not in job_market.columns:
        return {"years": [], "hiring_rates": [], "job_postings": []}

    grouped = (
        job_market.groupby("year", as_index=False)
        .agg(job_postings=("job_title", "count"))
        .sort_values("year")
    )

    grouped["hiring_rate"] = grouped["job_postings"].pct_change().fillna(0.0)

    return {
        "years": [int(year) for year in grouped["year"].tolist()],
        "hiring_rates": [round(float(rate), 4) for rate in grouped["hiring_rate"].tolist()],
        "job_postings": [int(count) for count in grouped["job_postings"].tolist()],
    }


def process_role_heatmap_data(all_data):
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "job_role" not in job_applications.columns:
        return {"data": []}

    heatmap_data = []
    for role, role_df in job_applications.groupby("job_role"):
        metrics = get_stage_metrics(role_df)
        applications = int(metrics["applications"].sum())
        callbacks = int(metrics["callbacks"].sum())
        interviews = int(metrics["interviews"].sum())
        offers = int(metrics["offers"].sum())

        heatmap_data.append(
            {
                "role": role,
                "app_to_callback": _safe_rate(callbacks, applications),
                "callback_to_interview": _safe_rate(interviews, callbacks),
                "interview_to_offer": _safe_rate(offers, interviews),
                "overall_conversion": _safe_rate(offers, applications),
            }
        )

    heatmap_data.sort(key=lambda row: row["overall_conversion"], reverse=True)
    return {"data": heatmap_data}