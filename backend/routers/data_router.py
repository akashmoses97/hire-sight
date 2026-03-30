"""Dataset access routes for the Hire Sight API.

This router returns cleaned source records and lightweight dataset summaries
from the shared in-memory store for debugging and inspection purposes.
"""

from fastapi import APIRouter, HTTPException
from data_store import all_data  # Import the global data
import pandas as pd

router = APIRouter()

def dataframe_to_records(df: pd.DataFrame):
    """Convert a DataFrame into JSON-serializable row dictionaries.

    Pandas timestamp columns are formatted as ``YYYY-MM-DD`` strings so the
    API returns payloads that can be serialized by FastAPI without custom
    encoders and consumed directly by the frontend.
    """
    if df is None or df.empty:
        return []

    serializable_df = df.copy()
    # Convert datetime columns explicitly because raw pandas timestamps are
    # not ideal for simple JSON responses.
    datetime_columns = serializable_df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns
    for column in datetime_columns:
        serializable_df[column] = serializable_df[column].dt.strftime("%Y-%m-%d")

    return serializable_df.to_dict("records")

@router.get("/data/job_applications")
async def get_job_applications_data():
    """Return the cleaned job applications dataset as JSON records.

    The endpoint reads from the shared in-memory cache populated at startup
    and raises a server error when the dataset is unavailable.
    """
    if 'job_applications' in all_data and all_data['job_applications'] is not None:
        return dataframe_to_records(all_data['job_applications'])
    raise HTTPException(status_code=500, detail="Job applications data not available")

@router.get("/data/recruitment_data")
async def get_recruitment_data():
    """Return the cleaned recruitment dataset used by the heatmap workflow.

    This exposes the normalized recruitment records from memory for manual
    inspection, debugging, or exploratory analysis outside the main charts.
    """
    if 'ai_recruitment' in all_data and all_data['ai_recruitment'] is not None:
        return dataframe_to_records(all_data['ai_recruitment'])
    raise HTTPException(status_code=500, detail="Recruitment data not available")

@router.get("/data/job_market_data")
async def get_job_market_data():
    """Return the cleaned job market dataset as JSON records.

    The payload contains normalized job posting data that powers the yearly
    trends endpoint and can also be inspected directly through this route.
    """
    if 'job_market' in all_data and all_data['job_market'] is not None:
        return dataframe_to_records(all_data['job_market'])
    raise HTTPException(status_code=500, detail="Job market data not available")

@router.get("/data/all")
async def get_all_data():
    """Return every cleaned dataset currently stored in memory.

    Each cached DataFrame is converted into JSON-safe row dictionaries so the
    response can be used to inspect the backend's complete loaded state.
    """
    result = {}
    for key, df in all_data.items():
        result[key] = dataframe_to_records(df)

    return result


@router.get("/data/summary")
async def get_data_summary():
    """Return row counts and column names for each cached dataset.

    This summary endpoint is useful for quickly checking whether startup
    loading succeeded and whether expected columns are available for analysis.
    """
    summary = {}
    for key, df in all_data.items():
        if df is None:
            summary[key] = {"rows": 0, "columns": []}
        else:
            summary[key] = {
                "rows": int(len(df.index)),
                "columns": [str(column) for column in df.columns.tolist()],
            }

    return summary
