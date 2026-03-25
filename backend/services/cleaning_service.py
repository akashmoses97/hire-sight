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
    cleaned = df.copy()
    cleaned.columns = [str(column).strip().lower().replace(" ", "_") for column in cleaned.columns]
    return cleaned


def _clean_strings(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    string_columns = cleaned.select_dtypes(include=["object", "string"]).columns
    for column in string_columns:
        cleaned[column] = cleaned[column].astype(str).str.strip()
        cleaned[column] = cleaned[column].replace({"": pd.NA, "nan": pd.NA, "None": pd.NA})
    return cleaned


def clean_job_applications(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = _normalize_columns(df)
    cleaned = _clean_strings(cleaned)

    if "application_date" in cleaned.columns:
        cleaned["application_date"] = pd.to_datetime(cleaned["application_date"], errors="coerce")

    for numeric_column in ["salary_expectation", "experience_required_years", "company_rating"]:
        if numeric_column in cleaned.columns:
            cleaned[numeric_column] = pd.to_numeric(cleaned[numeric_column], errors="coerce")

    if "status" in cleaned.columns:
        cleaned["status"] = (
            cleaned["status"]
            .astype("string")
            .str.lower()
            .map(STATUS_NORMALIZATION)
            .fillna(cleaned["status"])
        )

    required_columns = [column for column in ["application_id", "job_role", "application_date", "status"] if column in cleaned.columns]
    if required_columns:
        cleaned = cleaned.dropna(subset=required_columns)

    if "application_id" in cleaned.columns:
        cleaned = cleaned.drop_duplicates(subset=["application_id"], keep="last")

    if "application_date" in cleaned.columns:
        cleaned["year"] = cleaned["application_date"].dt.year
        cleaned["month"] = cleaned["application_date"].dt.month

    return cleaned


def clean_ai_recruitment(df: pd.DataFrame) -> pd.DataFrame:
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
    if df.empty or "status" not in df.columns:
        return pd.DataFrame(columns=["applications", "callbacks", "interviews", "offers"])

    statuses = df["status"].astype("string")
    metrics = pd.DataFrame(index=df.index)
    metrics["applications"] = 1
    metrics["callbacks"] = statuses.isin(["Assessment Pending", "Phone Screen", "Interview Scheduled", "Selected", "Rejected"]).astype(int)
    metrics["interviews"] = statuses.isin(["Interview Scheduled", "Selected"]).astype(int)
    metrics["offers"] = statuses.eq("Selected").astype(int)
    return metrics