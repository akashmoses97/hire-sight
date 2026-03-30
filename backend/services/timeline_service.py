"""Timeline analytics service.

This file converts application records into monthly stage counts so the
frontend can render time-based hiring pipeline trends and filtered views.
"""

import pandas as pd

from services.cleaning_service import get_stage_metrics

def _build_timeline(df: pd.DataFrame):
    """Aggregate application rows into monthly stage totals.

    The helper parses application dates, derives a month key, joins the stage
    indicator columns, and returns chart-ready dictionaries sorted by month.
    """
    if df.empty or "application_date" not in df.columns:
        return []

    work_df = df.copy()
    work_df["application_date"] = pd.to_datetime(work_df["application_date"], errors="coerce")
    work_df = work_df.dropna(subset=["application_date"])
    if work_df.empty:
        return []

    work_df["month_key"] = work_df["application_date"].dt.to_period("M").astype(str)
    # Stage indicators let us sum monthly counts without re-encoding status
    # rules inside the grouping step.
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
    """Return the full monthly timeline payload for all applications.

    The response preserves the ``{"timeline": ...}`` structure expected by
    the frontend, even though the underlying aggregation is handled elsewhere.
    """
    job_applications = all_data.get("job_applications")
    if job_applications is None:
        return None

    return {"timeline": _build_timeline(job_applications)}

def get_timeline_by_filters(all_data, filters):
    """Return monthly timeline data after applying filter dimensions.

    The same role/company/job type/platform filters used by the pipeline view
    are applied case-insensitively before monthly stage totals are computed.
    """
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
    """Return monthly stage counts for one calendar year.

    This is a year-focused variant of the timeline aggregation that keeps the
    month number in the response for simpler year-specific charting.
    """
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
