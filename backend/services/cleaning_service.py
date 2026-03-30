"""Dataset cleaning and normalization helpers.

This service standardizes raw CSV inputs, cleans text and date fields,
derives helper columns, and converts statuses into analytics-friendly values.
"""

import pandas as pd


STATUS_NORMALIZATION = {
    "applied": "Applied",
    "assessment pending": "Assessment Pending",
    "phone screen": "Phone Screen",
    "interview scheduled": "Interview Scheduled",
    "selected": "Selected",
    "rejected": "Rejected",
}

def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Return a copy of ``df`` with normalized column names.

    Column labels are stripped, lowercased, and converted to snake_case so
    downstream services can rely on consistent field names across datasets.
    """
    cleaned = df.copy()
    cleaned.columns = [str(column).strip().lower().replace(" ", "_") for column in cleaned.columns]
    return cleaned

def _clean_strings(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize string-like columns and replace blank sentinel values.

    Object and string columns are trimmed and common empty placeholders such
    as ``""``, ``"nan"``, and ``"None"`` are converted to ``pd.NA``.
    """
    cleaned = df.copy()
    string_columns = cleaned.select_dtypes(include=["object", "string"]).columns
    for column in string_columns:
        cleaned[column] = cleaned[column].astype(str).str.strip()
        cleaned[column] = cleaned[column].replace({"": pd.NA, "nan": pd.NA, "None": pd.NA})
    return cleaned

def clean_job_applications(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the job applications dataset for pipeline analysis.

    This routine normalizes column names, trims string values, parses dates,
    coerces known numeric fields, standardizes application statuses, removes
    invalid or duplicate records, and derives year/month helper columns.
    """
    cleaned = _normalize_columns(df)
    cleaned = _clean_strings(cleaned)

    if "application_date" in cleaned.columns:
        cleaned["application_date"] = pd.to_datetime(cleaned["application_date"], errors="coerce")

    for numeric_column in ["salary_expectation", "experience_required_years", "company_rating"]:
        if numeric_column in cleaned.columns:
            cleaned[numeric_column] = pd.to_numeric(cleaned[numeric_column], errors="coerce")

    if "status" in cleaned.columns:
        # Map varied raw statuses onto the smaller stage vocabulary used by
        # the analytics services.
        cleaned["status"] = (
            cleaned["status"]
            .astype("string")
            .str.lower()
            .map(STATUS_NORMALIZATION)
            .fillna(cleaned["status"])
        )

    # Ensure we don't drop rows missing job_role; keep total dataset coverage
    required_columns = [column for column in ["application_id", "application_date", "status"] if column in cleaned.columns]
    if required_columns:
        cleaned = cleaned.dropna(subset=required_columns)

    if "application_id" in cleaned.columns:
        cleaned = cleaned.drop_duplicates(subset=["application_id"], keep="last")

    if "application_date" in cleaned.columns:
        cleaned["year"] = cleaned["application_date"].dt.year
        cleaned["month"] = cleaned["application_date"].dt.month

    return cleaned

def clean_ai_recruitment(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the recruitment dataset used for role outcome analysis.

    The function standardizes text fields, normalizes decision labels,
    removes duplicate rows when an identifier exists, and drops records that
    cannot contribute to role-based selection/rejection summaries.
    """
    cleaned = _normalize_columns(df)
    cleaned = _clean_strings(cleaned)

    decision_mapping = {
        "select": "Selected",
        "selected": "Selected",
        "reject": "Rejected",
        "rejected": "Rejected",
    }

    if "decision" in cleaned.columns:
        cleaned["decision"] = cleaned["decision"].astype("string")
        cleaned["decision_standardized"] = cleaned["decision"].str.lower().map(decision_mapping).fillna(cleaned["decision"])

    id_column = "id" if "id" in cleaned.columns else None
    if id_column:
        cleaned = cleaned.drop_duplicates(subset=[id_column], keep="last")

    essential_columns = [column for column in ["role", "decision"] if column in cleaned.columns]
    if essential_columns:
        cleaned = cleaned.dropna(subset=essential_columns)

    return cleaned

def clean_job_market(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the job market dataset used for yearly trend analysis.

    The routine parses publication dates, converts salary fields to numeric
    values, removes inconsistent salary ranges, derives midpoint/year/month
    columns, and drops duplicate posting records when possible.
    """
    cleaned = _normalize_columns(df)
    cleaned = _clean_strings(cleaned)

    if "publication_date" in cleaned.columns:
        cleaned["publication_date"] = pd.to_datetime(cleaned["publication_date"], errors="coerce")

    for numeric_column in ["salary_min", "salary_max", "experience_required"]:
        if numeric_column in cleaned.columns:
            cleaned[numeric_column] = pd.to_numeric(cleaned[numeric_column], errors="coerce")

    if "salary_min" in cleaned.columns and "salary_max" in cleaned.columns:
        cleaned = cleaned[cleaned["salary_max"] >= cleaned["salary_min"]]
        cleaned["salary_midpoint"] = (cleaned["salary_min"] + cleaned["salary_max"]) / 2

    if "publication_date" in cleaned.columns:
        cleaned = cleaned.dropna(subset=["publication_date"])
        cleaned["year"] = cleaned["publication_date"].dt.year
        cleaned["month"] = cleaned["publication_date"].dt.month

    dedupe_columns = [column for column in ["job_title", "company", "publication_date"] if column in cleaned.columns]
    if dedupe_columns:
        cleaned = cleaned.drop_duplicates(subset=dedupe_columns, keep="last")

    return cleaned

def clean_all_datasets(data: dict) -> dict:
    """Clean every dataset in the loaded raw data bundle.

    Known dataset keys are routed to specialized cleaners, while unknown
    datasets still receive baseline column and string normalization so the
    backend can work with a predictable structure.
    """
    cleaned_data = {}

    for key, df in data.items():
        if df is None or not isinstance(df, pd.DataFrame):
            cleaned_data[key] = pd.DataFrame()
            continue

        if key == "job_applications":
            cleaned_data[key] = clean_job_applications(df)
        elif key == "ai_recruitment":
            cleaned_data[key] = clean_ai_recruitment(df)
        elif key == "job_market":
            cleaned_data[key] = clean_job_market(df)
        else:
            cleaned_data[key] = _clean_strings(_normalize_columns(df))

    return cleaned_data

def get_stage_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """Convert statuses into per-row stage indicator columns.

    Each returned row marks whether the source application counts toward the
    applications, callbacks, interviews, and offers stages used everywhere in
    the backend analytics payloads.
    """
    if df.empty or "status" not in df.columns:
        return pd.DataFrame(columns=["applications", "callbacks", "interviews", "offers"])

    statuses = df["status"].astype("string")
    metrics = pd.DataFrame(index=df.index)
    metrics["applications"] = 1
    metrics["callbacks"] = statuses.isin(["Assessment Pending", "Phone Screen", "Interview Scheduled", "Selected", "Rejected"]).astype(int)
    metrics["interviews"] = statuses.isin(["Interview Scheduled", "Selected"]).astype(int)
    metrics["offers"] = statuses.eq("Selected").astype(int)
    return metrics
