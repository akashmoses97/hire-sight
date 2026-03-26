import pandas as pd

from services.cleaning_service import get_stage_metrics


def _build_timeline(df: pd.DataFrame):
    if df.empty or "application_date" not in df.columns:
        return []

    work_df = df.copy()
    work_df["application_date"] = pd.to_datetime(work_df["application_date"], errors="coerce")
    work_df = work_df.dropna(subset=["application_date"])
    if work_df.empty:
        return []

    work_df["month_key"] = work_df["application_date"].dt.to_period("M").astype(str)
    stage_metrics = get_stage_metrics(work_df)
    work_df = pd.concat([work_df, stage_metrics], axis=1)

    grouped = (
        work_df.groupby("month_key")[["applications", "callbacks", "interviews", "offers"]]
        .sum()
        .reset_index()
        .sort_values("month_key")
    )

    return [
        {
            "date": row["month_key"],
            "applications": int(row["applications"]),
            "callbacks": int(row["callbacks"]),
            "interviews": int(row["interviews"]),
            "offers": int(row["offers"]),
        }
        for _, row in grouped.iterrows()
    ]


def process_timeline_data(all_data):
    job_applications = all_data.get("job_applications")
    if job_applications is None:
        return None

    return {"timeline": _build_timeline(job_applications)}


def get_timeline_by_filters(all_data, filters):
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "application_date" not in job_applications.columns:
        return None

    df = job_applications.copy()
    for key, value in filters.items():
        if value and value != 'All' and key in df.columns:
            df = df[df[key].astype("string").str.lower() == value.lower()]

    if df.empty:
        return {"timeline": []}

    return {"timeline": _build_timeline(df)}


def get_timeline_by_year(all_data, year):
    job_applications = all_data.get("job_applications")
    if job_applications is None or job_applications.empty or "application_date" not in job_applications.columns:
        return None

    work_df = job_applications.copy()
    work_df["application_date"] = pd.to_datetime(work_df["application_date"], errors="coerce")
    work_df = work_df[work_df["application_date"].dt.year == year]
    if work_df.empty:
        return None

    stage_metrics = get_stage_metrics(work_df)
    work_df = pd.concat([work_df, stage_metrics], axis=1)
    work_df["month"] = work_df["application_date"].dt.month

    grouped = (
        work_df.groupby("month")[["applications", "callbacks", "interviews", "offers"]]
        .sum()
        .reset_index()
        .sort_values("month")
    )

    return {
        "year": year,
        "monthly_data": [
            {
                "month": int(row["month"]),
                "applications": int(row["applications"]),
                "callbacks": int(row["callbacks"]),
                "interviews": int(row["interviews"]),
                "offers": int(row["offers"]),
            }
            for _, row in grouped.iterrows()
        ],
    }