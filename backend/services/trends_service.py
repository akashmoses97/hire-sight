"""Trend and heatmap analytics service.

This module transforms job market and recruitment datasets into yearly trend
series and role-based outcome summaries for the frontend visualizations.
"""

from __future__ import annotations

import pandas as pd


ROLE_MAPPING = {
    "data analyst": "Data Analyst",
    "data engineer": "Data Engineer",
    "data scientist": "Data Scientist",
    "data architect": "Data Architect",
    "software engineer": "Software Engineer",
    "software developer": "Software Engineer",
    "full stack developer": "Full Stack Developer",
    "ai engineer": "ML/AI Engineer",
    "machine learning engineer": "ML/AI Engineer",
    "ai researcher": "AI Researcher",
    "ui designer": "UI/UX Designer",
    "ux designer": "UI/UX Designer",
    "ui/ux designer": "UI/UX Designer",
    "cybersecurity analyst": "Cybersecurity",
    "cybersecurity specialist": "Cybersecurity",
    "cloud engineer": "Cloud Engineering",
    "cloud architect": "Cloud Engineering",
    "hr specialist": "HR Specialist",
    "human resources specialist": "HR Specialist",
    "product manager": "Product Manager",
    "project manager": "Project Manager",
    "qa engineer": "QA Engineer",
    "network engineer": "Network Engineer",
    "system administrator": "System Administrator",
    "database administrator": "Database Administrator",
    "devops engineer": "DevOps Engineer",
    "mobile app developer": "Mobile App Developer",
    "game developer": "Game Developer",
    "graphic designer": "Graphic Designer",
    "content writer": "Content Writer",
    "digital marketing specialist": "Digital Marketing Specialist",
    "e-commerce specialist": "E-commerce Specialist",
    "business analyst": "Business Analyst",
    "robotics engineer": "Robotics Engineer",
    "ar/vr developer": "AR/VR Developer",
    "it support specialist": "IT Support Specialist",
    "ui engineer": "UI Engineer",
}

EXPERIENCE_BUCKETS = [
    "Entry (0-2 yrs)",
    "Mid (3-5 yrs)",
    "Senior (6-8 yrs)",
    "Principal (9+ yrs)",
    "Unspecified",
]

SALARY_BUCKETS = [
    "Under $100k",
    "$100k-$125k",
    "$125k-$150k",
    "$150k+",
    "Unspecified",
]

TOP_N_OPTIONS = [5, 8, 10, 12]
MONTH_LABELS = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
}

REASON_CATEGORY_PATTERNS = [
    ("Technical Skills", ["technical skill", "technical skills", "coding", "programming", "software development"]),
    ("AI / Machine Learning", [" ai ", " ml ", "machine learning", "deep learning", "neural network", "llm"]),
    ("Leadership", ["leadership", "leader", "management", "managerial", "senior position"]),
    ("Communication", ["communication", "communicate", "interpersonal", "presentation", "stakeholder"]),
    ("System Design", ["system design", "architecture", "architectural", "design expertise", "scalability"]),
    ("Experience Level", ["experience", "background", "years", "senior", "junior", "entry level", "mid-level"]),
    ("Culture Fit", ["culture fit", "team fit", "organizational fit", "fit for the role", "cultural fit"]),
    ("Domain Knowledge", ["domain knowledge", "industry knowledge", "business knowledge", "domain expertise"]),
    ("Problem Solving", ["problem solving", "analytical", "critical thinking", "troubleshooting"]),
    ("Project Experience", ["project experience", "project work", "portfolio", "hands-on project", "practical experience"]),
    ("Relevant Tools", ["tooling", "tools", "framework", "frameworks", "technology stack", "tech stack", "platform experience"]),
    ("Collaboration", ["collaboration", "cross-functional", "teamwork", "worked with teams", "collaborative"]),
    ("Adaptability", ["adaptability", "adaptable", "learning quickly", "fast learner", "flexibility"]),
    ("Role Alignment", ["role alignment", "aligned with the role", "not aligned", "mismatch", "role fit"]),
    ("Education / Certification", ["education", "degree", "academic background", "certification", "certified"]),
    ("Strategic Thinking", ["strategic thinking", "strategy", "strategic", "vision"]),
]


def _normalize_role(role):
    """Normalize a raw recruitment role into a display-friendly category."""
    cleaned = str(role).strip()
    lowered = cleaned.lower()
    return ROLE_MAPPING.get(lowered, cleaned.title())


def _categorize_reason(reason):
    """Map free-text decision reasons into a compact set of heatmap categories."""
    text = f" {str(reason).strip().lower()} "
    if not text:
        return "Other"

    for category, patterns in REASON_CATEGORY_PATTERNS:
        if any(pattern in text for pattern in patterns):
            return category

    return "Other"


def _safe_rate(numerator: int, denominator: int) -> float:
    """Return a rounded ratio while protecting against empty denominators."""
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)


def _normalize_text_value(value, fallback: str = "Unknown") -> str:
    """Return a trimmed display string while collapsing blank sentinels."""
    if pd.isna(value):
        return fallback

    text = str(value).strip()
    if text == "" or text.lower() in {"nan", "none"}:
        return fallback
    return text


def _normalize_job_type(value) -> str:
    """Normalize noisy job type labels into a smaller frontend taxonomy."""
    text = _normalize_text_value(value).lower()

    if text in {"remote", "remotely"}:
        return "Remote"
    if "full time" in text or "full-time" in text:
        return "Full-time"
    if "part time" in text or "part-time" in text:
        return "Part-time"
    if "contract" in text:
        return "Contract"
    if "intern" in text:
        return "Internship"
    if "working student" in text:
        return "Working Student"
    if text in {"berufserfahren", "professional / experienced"}:
        return "Experienced"
    if text in {"manager", "management"}:
        return "Management"
    if text == "unknown":
        return "Unknown"

    return text.title()


def _normalize_location(value) -> str:
    """Normalize location labels while keeping the visible display value stable."""
    text = _normalize_text_value(value)
    if text.lower() == "remote":
        return "Remote"
    return text


def _bucket_experience(value) -> str:
    """Bucket years of required experience for filtering and summaries."""
    if pd.isna(value):
        return "Unspecified"
    years = float(value)
    if years <= 2:
        return "Entry (0-2 yrs)"
    if years <= 5:
        return "Mid (3-5 yrs)"
    if years <= 8:
        return "Senior (6-8 yrs)"
    return "Principal (9+ yrs)"


def _bucket_salary(value) -> str:
    """Bucket salary midpoint values for filtering and summaries."""
    if pd.isna(value):
        return "Unspecified"
    salary = float(value)
    if salary < 100_000:
        return "Under $100k"
    if salary < 125_000:
        return "$100k-$125k"
    if salary < 150_000:
        return "$125k-$150k"
    return "$150k+"


def _normalize_top_n(value) -> int:
    """Clamp the user-controlled top-N size to a small safe range."""
    try:
        top_n = int(value)
    except (TypeError, ValueError):
        return 8
    return max(3, min(top_n, 15))


def _prepare_job_market_dataframe(all_data) -> pd.DataFrame:
    """Return a normalized job-market frame tailored to trends analytics."""
    dataset_key = None
    job_market = None
    for candidate_key in ["yearly_trends_job_market", "job_market"]:
        candidate = all_data.get(candidate_key)
        if candidate is not None and not candidate.empty:
            job_market = candidate
            dataset_key = candidate_key
            break

    if job_market is None or job_market.empty:
        return pd.DataFrame()

    df = job_market.copy()
    required_defaults = {
        "job_title": "Unknown",
        "company": "Unknown",
        "location": "Unknown",
        "job_type": "Unknown",
        "salary_midpoint": pd.NA,
        "experience_required": pd.NA,
        "publication_date": pd.NaT,
    }
    for column, default in required_defaults.items():
        if column not in df.columns:
            df[column] = default

    df["job_title"] = df["job_title"].apply(_normalize_text_value)
    df["company"] = df["company"].apply(_normalize_text_value)
    df["location"] = df["location"].apply(_normalize_location)
    df["job_type"] = df["job_type"].apply(_normalize_job_type)
    df["experience_required"] = pd.to_numeric(df["experience_required"], errors="coerce")
    df["salary_midpoint"] = pd.to_numeric(df["salary_midpoint"], errors="coerce")
    df["publication_date"] = pd.to_datetime(df["publication_date"], errors="coerce")

    if "year" not in df.columns:
        df["year"] = df["publication_date"].dt.year
    if "month" not in df.columns:
        df["month"] = df["publication_date"].dt.month

    df["remote_flag"] = (
        df["job_type"].str.lower().eq("remote") | df["location"].str.lower().eq("remote")
    )
    df["experience_bucket"] = df["experience_required"].apply(_bucket_experience)
    df["salary_bucket"] = df["salary_midpoint"].apply(_bucket_salary)
    df["source_dataset"] = dataset_key

    return df


def _clean_filter_value(value):
    """Convert empty/All query values into ``None`` for service filtering."""
    if value is None:
        return None
    text = str(value).strip()
    if text == "" or text == "All":
        return None
    return text


def _sanitize_yearly_filters(filters: dict | None) -> dict:
    """Normalize trends filter values into a consistent internal structure."""
    filters = filters or {}
    return {
        "job_title": _clean_filter_value(filters.get("job_title")),
        "company": _clean_filter_value(filters.get("company")),
        "location": _clean_filter_value(filters.get("location")),
        "job_type": _clean_filter_value(filters.get("job_type")),
        "experience_bucket": _clean_filter_value(filters.get("experience_bucket")),
        "salary_bucket": _clean_filter_value(filters.get("salary_bucket")),
        "remote_only": str(filters.get("remote_only", "")).lower() in {"true", "1", "yes", "on"},
        "top_n": _normalize_top_n(filters.get("top_n", 8)),
    }


def _apply_yearly_filters(df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    """Apply sanitized trends filters to the normalized job-market dataset."""
    filtered = df.copy()
    for column in ["job_title", "company", "location", "job_type", "experience_bucket", "salary_bucket"]:
        value = filters.get(column)
        if value:
            filtered = filtered[filtered[column] == value]

    if filters.get("remote_only"):
        filtered = filtered[filtered["remote_flag"]]

    return filtered


def _build_distribution(df: pd.DataFrame, column: str, label_key: str, total: int, top_n: int, salary_metric: bool = False):
    """Build top-N distributions for breakdown cards and mini leaderboards."""
    aggregations = {"count": (column, "size")}
    if salary_metric:
        aggregations["average_salary"] = ("salary_midpoint", "mean")

    grouped = (
        df.groupby(column)
        .agg(**aggregations)
        .reset_index()
        .sort_values(
            ["count", "average_salary" if salary_metric else column, column],
            ascending=[False, False if salary_metric else True, True],
        )
        .head(top_n)
    )

    results = []
    for row in grouped.itertuples(index=False):
        item = {
            label_key: getattr(row, column),
            "count": int(row.count),
            "share": _safe_rate(int(row.count), total),
        }
        if salary_metric:
            avg_salary = getattr(row, "average_salary")
            item["average_salary"] = round(float(avg_salary), 2) if pd.notna(avg_salary) else None
        results.append(item)
    return results


def _empty_yearly_trends(filters: dict | None = None) -> dict:
    """Return a stable empty payload for the yearly trends view."""
    sanitized = _sanitize_yearly_filters(filters)
    return {
        "years": [],
        "hiring_rates": [],
        "growth_rates": [],
        "job_postings": [],
        "yearly_breakdown": [],
        "latest_year_monthly_breakdown": [],
        "job_type_distribution": [],
        "top_roles": [],
        "top_locations": [],
        "top_companies": [],
        "filters": {
            "applied": sanitized,
            "active_count": int(
                sum(
                    bool(sanitized[key])
                    for key in [
                        "job_title",
                        "company",
                        "location",
                        "job_type",
                        "experience_bucket",
                        "salary_bucket",
                    ]
                )
                + int(sanitized["remote_only"])
            ),
        },
        "summary": {
            "dataset_source": None,
            "total_postings": 0,
            "latest_year": None,
            "available_years": [],
            "has_multiple_years": False,
            "view_mode": "empty",
            "coverage_window_days": 0,
            "date_range": {"start": None, "end": None},
            "average_salary": None,
            "median_salary": None,
            "median_experience": None,
            "remote_share": 0.0,
            "distinct_companies": 0,
            "top_job_type": None,
            "top_role": None,
            "top_company": None,
            "highest_paying_role": None,
            "highest_volume_year": None,
            "fastest_growth_year": None,
            "recent_market_share": 0.0,
        },
    }


def get_yearly_trend_filter_options(all_data):
    """Return distinct normalized filter options for the trends page."""
    df = _prepare_job_market_dataframe(all_data)
    if df.empty:
        return {
            "job_titles": [],
            "companies": [],
            "locations": [],
            "job_types": [],
            "experience_buckets": EXPERIENCE_BUCKETS,
            "salary_buckets": SALARY_BUCKETS,
            "top_n_options": TOP_N_OPTIONS,
        }

    return {
        "job_titles": sorted(df["job_title"].dropna().unique().tolist()),
        "companies": sorted(df["company"].dropna().unique().tolist()),
        "locations": sorted(df["location"].dropna().unique().tolist()),
        "job_types": sorted(df["job_type"].dropna().unique().tolist()),
        "experience_buckets": EXPERIENCE_BUCKETS,
        "salary_buckets": SALARY_BUCKETS,
        "top_n_options": TOP_N_OPTIONS,
    }


def process_yearly_trends(all_data, filters: dict | None = None):
    """Build the yearly hiring trends payload from job market postings.

    The response still exposes the original yearly arrays, but it now supports
    filters and richer market summaries such as company concentration, salary
    medians, and highest-paying roles for the selected slice.
    """
    base_df = _prepare_job_market_dataframe(all_data)
    sanitized_filters = _sanitize_yearly_filters(filters)
    if base_df.empty or "year" not in base_df.columns:
        return _empty_yearly_trends(sanitized_filters)

    df = _apply_yearly_filters(base_df, sanitized_filters)
    if df.empty:
        return _empty_yearly_trends(sanitized_filters)

    grouped = (
        df.groupby("year", as_index=False)
        .agg(
            job_postings=("job_title", "count"),
            average_salary=("salary_midpoint", "mean"),
            median_salary=("salary_midpoint", "median"),
            median_experience=("experience_required", "median"),
        )
        .sort_values("year")
    )
    grouped["growth_rate"] = grouped["job_postings"].pct_change().fillna(0.0)

    remote_by_year = df.groupby("year")["remote_flag"].sum().to_dict()
    top_job_type_by_year = (
        df.groupby(["year", "job_type"])
        .size()
        .reset_index(name="count")
        .sort_values(["year", "count", "job_type"], ascending=[True, False, True])
        .drop_duplicates(subset=["year"], keep="first")
        .set_index("year")
    )

    yearly_breakdown = []
    for row in grouped.itertuples(index=False):
        year = int(row.year)
        postings = int(row.job_postings)
        top_job_type = None
        if year in top_job_type_by_year.index:
            type_row = top_job_type_by_year.loc[year]
            top_job_type = {
                "name": str(type_row["job_type"]),
                "count": int(type_row["count"]),
                "share": _safe_rate(int(type_row["count"]), postings),
            }

        yearly_breakdown.append(
            {
                "year": year,
                "job_postings": postings,
                "growth_rate": round(float(row.growth_rate), 4),
                "average_salary": round(float(row.average_salary), 2) if pd.notna(row.average_salary) else None,
                "median_salary": round(float(row.median_salary), 2) if pd.notna(row.median_salary) else None,
                "median_experience": round(float(row.median_experience), 1) if pd.notna(row.median_experience) else None,
                "remote_share": _safe_rate(int(remote_by_year.get(year, 0)), postings),
                "top_job_type": top_job_type,
            }
        )

    total_postings = int(len(df))
    available_years = [int(year) for year in grouped["year"].tolist()]

    if df["publication_date"].notna().any():
        min_date = df["publication_date"].min()
        max_date = df["publication_date"].max()
        date_range = {
            "start": min_date.date().isoformat(),
            "end": max_date.date().isoformat(),
        }
        coverage_window_days = int((max_date.normalize() - min_date.normalize()).days) + 1
    else:
        date_range = {"start": None, "end": None}
        coverage_window_days = 0

    top_n = sanitized_filters["top_n"]
    job_type_distribution = _build_distribution(df, "job_type", "job_type", total_postings, top_n)
    top_roles = _build_distribution(df, "job_title", "job_title", total_postings, top_n, salary_metric=True)
    top_locations = _build_distribution(df, "location", "location", total_postings, top_n)
    top_companies = _build_distribution(df, "company", "company", total_postings, top_n, salary_metric=True)

    highest_volume = max(yearly_breakdown, key=lambda item: item["job_postings"], default=None)
    fastest_growth = max(yearly_breakdown[1:], key=lambda item: item["growth_rate"], default=None) if len(yearly_breakdown) > 1 else None

    salary_by_role = (
        df.groupby("job_title")["salary_midpoint"]
        .mean()
        .dropna()
        .sort_values(ascending=False)
    )
    highest_paying_role = None
    if not salary_by_role.empty:
        role_name = salary_by_role.index[0]
        highest_paying_role = {
            "job_title": role_name,
            "average_salary": round(float(salary_by_role.iloc[0]), 2),
        }

    latest_year = available_years[-1] if available_years else None
    latest_year_monthly_breakdown = []
    latest_year_share = 0.0
    if latest_year is not None:
        latest_year_df = df[df["year"] == latest_year].copy()
        latest_year_total = int(len(latest_year_df.index))
        latest_year_share = _safe_rate(latest_year_total, total_postings)

        monthly_grouped = (
            latest_year_df.groupby("month", as_index=False)
            .agg(
                job_postings=("job_title", "count"),
                average_salary=("salary_midpoint", "mean"),
                median_salary=("salary_midpoint", "median"),
                median_experience=("experience_required", "median"),
                remote_count=("remote_flag", "sum"),
                distinct_companies=("company", "nunique"),
            )
            .sort_values("month")
        )

        top_job_type_by_month = (
            latest_year_df.groupby(["month", "job_type"])
            .size()
            .reset_index(name="count")
            .sort_values(["month", "count", "job_type"], ascending=[True, False, True])
            .drop_duplicates(subset=["month"], keep="first")
            .set_index("month")
        )

        for row in monthly_grouped.itertuples(index=False):
            month = int(row.month)
            postings = int(row.job_postings)
            top_job_type = None
            if month in top_job_type_by_month.index:
                type_row = top_job_type_by_month.loc[month]
                top_job_type = {
                    "name": str(type_row["job_type"]),
                    "count": int(type_row["count"]),
                    "share": _safe_rate(int(type_row["count"]), postings),
                }

            latest_year_monthly_breakdown.append(
                {
                    "month": month,
                    "month_label": MONTH_LABELS.get(month, str(month)),
                    "job_postings": postings,
                    "average_salary": round(float(row.average_salary), 2) if pd.notna(row.average_salary) else None,
                    "median_salary": round(float(row.median_salary), 2) if pd.notna(row.median_salary) else None,
                    "median_experience": round(float(row.median_experience), 1) if pd.notna(row.median_experience) else None,
                    "remote_share": _safe_rate(int(row.remote_count), postings),
                    "distinct_companies": int(row.distinct_companies),
                    "top_job_type": top_job_type,
                }
            )

    summary = {
        "dataset_source": str(df["source_dataset"].iloc[0]) if "source_dataset" in df.columns and not df.empty else None,
        "total_postings": total_postings,
        "latest_year": latest_year,
        "available_years": available_years,
        "has_multiple_years": len(available_years) > 1,
        "view_mode": "trend" if len(available_years) > 1 else "snapshot",
        "coverage_window_days": coverage_window_days,
        "date_range": date_range,
        "average_salary": round(float(df["salary_midpoint"].mean()), 2) if df["salary_midpoint"].notna().any() else None,
        "median_salary": round(float(df["salary_midpoint"].median()), 2) if df["salary_midpoint"].notna().any() else None,
        "median_experience": round(float(df["experience_required"].median()), 1) if df["experience_required"].notna().any() else None,
        "remote_share": _safe_rate(int(df["remote_flag"].sum()), total_postings),
        "distinct_companies": int(df["company"].nunique()),
        "top_job_type": job_type_distribution[0] if job_type_distribution else None,
        "top_role": top_roles[0] if top_roles else None,
        "top_company": top_companies[0] if top_companies else None,
        "highest_paying_role": highest_paying_role,
        "highest_volume_year": highest_volume["year"] if highest_volume else None,
        "fastest_growth_year": fastest_growth["year"] if fastest_growth else None,
        "recent_market_share": latest_year_share,
    }

    active_count = int(
        sum(
            bool(sanitized_filters[key])
            for key in [
                "job_title",
                "company",
                "location",
                "job_type",
                "experience_bucket",
                "salary_bucket",
            ]
        )
        + int(sanitized_filters["remote_only"])
    )

    return {
        "years": available_years,
        "hiring_rates": [item["growth_rate"] for item in yearly_breakdown],
        "growth_rates": [item["growth_rate"] for item in yearly_breakdown],
        "job_postings": [item["job_postings"] for item in yearly_breakdown],
        "yearly_breakdown": yearly_breakdown,
        "latest_year_monthly_breakdown": latest_year_monthly_breakdown,
        "job_type_distribution": job_type_distribution,
        "top_roles": top_roles,
        "top_locations": top_locations,
        "top_companies": top_companies,
        "filters": {
            "applied": sanitized_filters,
            "active_count": active_count,
        },
        "summary": summary,
    }


def process_role_heatmap_data(all_data):
    """Build role-level selection and rejection metrics for the heatmap.

    Recruitment rows are normalized to a consistent role taxonomy, filtered to
    select/reject decisions, aggregated by role, and converted into counts and
    percentages that the frontend can visualize directly.
    """
    recruitment_df = all_data.get("ai_recruitment")
    if recruitment_df is None or recruitment_df.empty:
        return None

    columns = {column.lower(): column for column in recruitment_df.columns}
    role_column = columns.get("role")
    decision_column = columns.get("decision")

    if role_column is None or decision_column is None:
        return None

    df = recruitment_df.loc[:, [role_column, decision_column]].copy()
    df.columns = ["Role", "decision"]

    df["Role"] = df["Role"].astype(str).str.strip()
    df["decision"] = df["decision"].astype(str).str.strip().str.lower()
    df = df[(df["Role"] != "") & (df["decision"].isin(["select", "reject"]))]

    if df.empty:
        return None

    df["cleaned_role"] = df["Role"].apply(_normalize_role)

    counts = (
        df.groupby(["cleaned_role", "decision"])
        .size()
        .unstack(fill_value=0)
        .reindex(columns=["select", "reject"], fill_value=0)
    )

    totals = counts.sum(axis=1)
    rates = counts.div(totals, axis=0).fillna(0)
    rates = rates.sort_values(by="select", ascending=False)

    data = []
    for role, row in rates.iterrows():
        selected_count = int(counts.loc[role, "select"])
        rejected_count = int(counts.loc[role, "reject"])
        total = int(totals.loc[role])
        data.append(
            {
                "role": role,
                "selected_rate": round(float(row["select"]), 4),
                "rejected_rate": round(float(row["reject"]), 4),
                "selected_count": selected_count,
                "rejected_count": rejected_count,
                "total": total,
            }
        )

    return {
        "outcomes": ["Selected %", "Rejected %"],
        "data": data,
    }


def process_reason_heatmap_data(all_data):
    """Build reason-category selection and rejection metrics for the heatmap."""
    recruitment_df = all_data.get("ai_recruitment")
    if recruitment_df is None or recruitment_df.empty:
        return None

    columns = {column.lower(): column for column in recruitment_df.columns}
    reason_column = columns.get("reason_for_decision")
    decision_column = columns.get("decision")

    if reason_column is None or decision_column is None:
        return None

    df = recruitment_df.loc[:, [reason_column, decision_column]].copy()
    df.columns = ["reason", "decision"]

    df["reason"] = df["reason"].astype(str).str.strip()
    df["decision"] = df["decision"].astype(str).str.strip().str.lower()
    df = df[(df["reason"] != "") & (df["decision"].isin(["select", "reject"]))]

    if df.empty:
        return None

    df["reason_category"] = df["reason"].apply(_categorize_reason)

    counts = (
        df.groupby(["reason_category", "decision"])
        .size()
        .unstack(fill_value=0)
        .reindex(columns=["select", "reject"], fill_value=0)
    )

    totals = counts.sum(axis=1)
    rates = counts.div(totals, axis=0).fillna(0)
    rates = rates.sort_values(by="select", ascending=False)

    data = []
    for reason, row in rates.iterrows():
        selected_count = int(counts.loc[reason, "select"])
        rejected_count = int(counts.loc[reason, "reject"])
        total = int(totals.loc[reason])
        data.append(
            {
                "reason": reason,
                "selected_rate": round(float(row["select"]), 4),
                "rejected_rate": round(float(row["reject"]), 4),
                "selected_count": selected_count,
                "rejected_count": rejected_count,
                "total": total,
            }
        )

    return {
        "outcomes": ["Selected %", "Rejected %"],
        "data": data,
    }
