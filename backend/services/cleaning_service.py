"""Dataset cleaning and normalization helpers.

This service standardizes raw CSV inputs, cleans text and date fields,
derives helper columns, and converts statuses into analytics-friendly values.
"""

import re
import pandas as pd


STATUS_NORMALIZATION = {
    "applied": "Applied",
    "assessment pending": "Assessment Pending",
    "phone screen": "Phone Screen",
    "interview scheduled": "Interview Scheduled",
    "selected": "Selected",
    "rejected": "Rejected",
}

TITLE_EXPERIENCE_MAPPING = {
    "intern": 0,
    "junior": 1,
    "entry": 1,
    "associate": 3,
    "software engineer ii": 3,
    "mid-level": 4,
    "mid level": 4,
    "senior": 6,
    "staff": 8,
    "lead": 8,
    "principal": 10,
    "architect": 10,
    "manager": 10,
    "director": 12,
}

SOFTWARE_TITLE_PATTERN = re.compile(
    r"software|developer|full[-\s]?stack|front[-\s]?end|back[-\s]?end|web\b|mobile|ios|android|"
    r"embedded|firmware|devops|site reliability|sre\b|platform|cloud|security|qa\b|quality assurance|"
    r"data engineer|machine learning|ml\b|ai\b|application engineer|systems engineer|java\b|python\b|\.net|"
    r"c\+\+|c#",
    re.IGNORECASE,
)

SOFTWARE_DESCRIPTION_PATTERN = re.compile(
    r"software|code|coding|developer|engineering team|application development|distributed systems|"
    r"frontend|backend|full stack|api|cloud|devops|machine learning|data pipeline|embedded|firmware|"
    r"python|java|javascript|typescript|react|node|c\+\+|c#|\.net",
    re.IGNORECASE,
)

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

def _parse_mixed_datetime(series: pd.Series) -> pd.Series:
    """Parse datetimes from mixed string and Unix timestamp inputs.

    Some source CSVs contain ISO-like dates alongside Unix timestamps stored as
    numeric strings. This helper attempts the normal pandas parser first, then
    retries unresolved numeric values as seconds or milliseconds since epoch.
    """
    parsed = pd.to_datetime(series, errors="coerce")
    numeric = pd.to_numeric(series, errors="coerce")
    valid_numeric = numeric.notna()
    if not valid_numeric.any():
        return parsed

    epoch_values = numeric.loc[valid_numeric]
    seconds_mask = epoch_values.between(1_000_000_000, 9_999_999_999)
    milliseconds_mask = epoch_values.between(1_000_000_000_000, 9_999_999_999_999)

    if seconds_mask.any():
        parsed.loc[seconds_mask.index[seconds_mask]] = pd.to_datetime(
            epoch_values.loc[seconds_mask],
            unit="s",
            errors="coerce",
        )

    if milliseconds_mask.any():
        parsed.loc[milliseconds_mask.index[milliseconds_mask]] = pd.to_datetime(
            epoch_values.loc[milliseconds_mask],
            unit="ms",
            errors="coerce",
        )

    return parsed

def _coalesce_datetime_columns(df: pd.DataFrame, candidates: list[str]) -> pd.Series:
    """Combine multiple possible datetime columns into one parsed series."""
    parsed_columns = []
    for column in candidates:
        if column in df.columns:
            parsed_columns.append(_parse_mixed_datetime(df[column]))

    if not parsed_columns:
        return pd.Series(pd.NaT, index=df.index)

    result = parsed_columns[0]
    for parsed in parsed_columns[1:]:
        result = result.fillna(parsed)
    return result

def _coalesce_text_columns(df: pd.DataFrame, candidates: list[str], fallback: str | None = None) -> pd.Series:
    """Combine multiple possible text columns into one normalized series."""
    result = pd.Series(pd.NA, index=df.index, dtype="object")
    for column in candidates:
        if column in df.columns:
            result = result.fillna(df[column])

    if fallback is not None:
        result = result.fillna(fallback)
    return result

def _first_existing_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """Return the first candidate column present in ``df``."""
    for column in candidates:
        if column in df.columns:
            return column
    return None

def _coerce_numeric_series(df: pd.DataFrame, candidates: list[str]) -> pd.Series:
    """Return the first numeric-convertible column from ``candidates``."""
    column = _first_existing_column(df, candidates)
    if column is None:
        return pd.Series(pd.NA, index=df.index, dtype="object")
    return pd.to_numeric(df[column], errors="coerce")

def _derive_experience_from_text(title_series: pd.Series, description_series: pd.Series) -> pd.Series:
    """Estimate experience years from posting text when no numeric field exists."""
    title_text = title_series.fillna("").astype("string").str.lower()
    description_text = description_series.fillna("").astype("string").str.lower()
    combined_text = (title_text + " " + description_text).str.strip()

    extracted = combined_text.str.extract(
        r'(?P<min_years>\d{1,2})\s*(?:\+|plus)?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)\b'
    )["min_years"]
    result = pd.to_numeric(extracted, errors="coerce")

    for phrase, years in TITLE_EXPERIENCE_MAPPING.items():
        phrase_mask = title_text.str.contains(re.escape(phrase), regex=True, na=False)
        if phrase_mask.any():
            result.loc[phrase_mask & result.isna()] = years

    return pd.to_numeric(result, errors="coerce")

def _derive_job_type_from_text(location_series: pd.Series, title_series: pd.Series, description_series: pd.Series) -> pd.Series:
    """Infer a coarse work arrangement label from location and posting text."""
    location_text = location_series.fillna("").astype("string").str.lower()
    title_text = title_series.fillna("").astype("string").str.lower()
    description_text = description_series.fillna("").astype("string").str.lower()
    combined_text = (title_text + " " + description_text + " " + location_text).str.strip()

    result = pd.Series(pd.NA, index=combined_text.index, dtype="object")

    hybrid_mask = combined_text.str.contains(r'\bhybrid\b', regex=True, na=False)
    remote_mask = combined_text.str.contains(r'\bremote\b|work from home|\bwfh\b', regex=True, na=False)
    onsite_mask = combined_text.str.contains(r'\bon[-\s]?site\b|in[-\s]?office|on premises', regex=True, na=False)

    result.loc[onsite_mask] = "Onsite"
    result.loc[remote_mask] = "Remote"
    result.loc[hybrid_mask] = "Hybrid"

    explicit_location_mask = location_text.str.strip().ne("") & location_text.ne("unknown")
    result.loc[result.isna() & explicit_location_mask] = "Location-based"
    result = result.fillna("Unknown")
    return result

def _is_software_focused_role(title_series: pd.Series, description_series: pd.Series) -> pd.Series:
    """Return a mask for rows that look like software or CS roles."""
    title_text = title_series.fillna("").astype("string")
    description_text = description_series.fillna("").astype("string")

    title_match = title_text.str.contains(SOFTWARE_TITLE_PATTERN, na=False)
    engineer_in_title = title_text.str.contains(r"\bengineer\b", case=False, regex=True, na=False)
    description_match = description_text.str.contains(SOFTWARE_DESCRIPTION_PATTERN, na=False)
    return title_match | (engineer_in_title & description_match)

def clean_job_applications(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the job applications dataset for pipeline analysis.

    This routine normalizes column names, trims string values, parses dates,
    coerces known numeric fields, standardizes application statuses, removes
    invalid or duplicate records, and derives year/month helper columns.
    """
    cleaned = _normalize_columns(df)
    cleaned = _clean_strings(cleaned)

    if "application_date" in cleaned.columns:
        cleaned["application_date"] = _parse_mixed_datetime(cleaned["application_date"])

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
        cleaned["publication_date"] = _parse_mixed_datetime(cleaned["publication_date"])

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

def clean_yearly_trends_job_market(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the Hugging Face engineering jobs dataset for yearly trends only.

    This source has reliable salaries and dates but lacks explicit work-type
    and experience columns, so those are derived heuristically from posting
    text without affecting the rest of the backend datasets.
    """
    cleaned = _normalize_columns(df)
    cleaned = _clean_strings(cleaned)

    cleaned["publication_date"] = _coalesce_datetime_columns(
        cleaned,
        ["date_posted", "publication_date", "posted_date", "date"],
    )
    cleaned["job_title"] = _coalesce_text_columns(cleaned, ["job_title", "title"], "Unknown")
    cleaned["company"] = _coalesce_text_columns(cleaned, ["company", "company_name"], "Unknown")
    cleaned["location"] = _coalesce_text_columns(cleaned, ["location", "job_location"], "Unknown")
    cleaned["description"] = _coalesce_text_columns(cleaned, ["description"], "")
    software_focus_mask = _is_software_focused_role(
        cleaned["job_title"],
        cleaned["description"],
    )
    cleaned = cleaned[software_focus_mask].copy()
    cleaned["job_type"] = _derive_job_type_from_text(
        cleaned["location"],
        cleaned["job_title"],
        cleaned["description"],
    )

    cleaned["salary_min"] = _coerce_numeric_series(cleaned, ["salary_min", "min_salary"])
    cleaned["salary_max"] = _coerce_numeric_series(cleaned, ["salary_max", "max_salary"])

    valid_salary_mask = (
        cleaned["salary_min"].isna()
        | cleaned["salary_max"].isna()
        | (cleaned["salary_max"] >= cleaned["salary_min"])
    )
    cleaned = cleaned[valid_salary_mask]
    cleaned["salary_midpoint"] = (cleaned["salary_min"] + cleaned["salary_max"]) / 2
    cleaned["experience_required"] = _derive_experience_from_text(
        cleaned["job_title"],
        cleaned["description"],
    )

    cleaned = cleaned.dropna(subset=["publication_date"], how="any")
    cleaned["year"] = cleaned["publication_date"].dt.year
    cleaned["month"] = cleaned["publication_date"].dt.month

    dedupe_column = _first_existing_column(cleaned, ["url", "job_url"])
    if dedupe_column is not None:
        cleaned = cleaned.drop_duplicates(subset=[dedupe_column], keep="last")
    else:
        cleaned = cleaned.drop_duplicates(
            subset=["job_title", "company", "location", "publication_date"],
            keep="last",
        )

    canonical_columns = [
        "job_title",
        "company",
        "location",
        "job_type",
        "salary_min",
        "salary_max",
        "salary_midpoint",
        "experience_required",
        "publication_date",
        "year",
        "month",
    ]
    return cleaned[canonical_columns]

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
        elif key == "yearly_trends_job_market":
            cleaned_data[key] = clean_yearly_trends_job_market(df)
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
