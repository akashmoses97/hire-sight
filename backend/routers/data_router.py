from fastapi import APIRouter, HTTPException
from data_store import all_data  # Import the global data
import pandas as pd

router = APIRouter()


def dataframe_to_records(df: pd.DataFrame):
    if df is None or df.empty:
        return []

    serializable_df = df.copy()
    datetime_columns = serializable_df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns
    for column in datetime_columns:
        serializable_df[column] = serializable_df[column].dt.strftime("%Y-%m-%d")

    return serializable_df.to_dict("records")

@router.get("/data/job_applications")
async def get_job_applications_data():
    """Get cleaned job applications data"""
    if 'job_applications' in all_data and all_data['job_applications'] is not None:
        return dataframe_to_records(all_data['job_applications'])
    raise HTTPException(status_code=500, detail="Job applications data not available")

@router.get("/data/recruitment_data")
async def get_recruitment_data():
    """Get cleaned AI recruitment pipeline data"""
    if 'ai_recruitment' in all_data and all_data['ai_recruitment'] is not None:
        return dataframe_to_records(all_data['ai_recruitment'])
    raise HTTPException(status_code=500, detail="Recruitment data not available")

@router.get("/data/job_market_data")
async def get_job_market_data():
    """Get cleaned job market insight data"""
    if 'job_market' in all_data and all_data['job_market'] is not None:
        return dataframe_to_records(all_data['job_market'])
    raise HTTPException(status_code=500, detail="Job market data not available")

@router.get("/data/all")
async def get_all_data():
    """Get all cleaned datasets"""
    result = {}
    for key, df in all_data.items():
        result[key] = dataframe_to_records(df)

    return result


@router.get("/data/summary")
async def get_data_summary():
    """Get row and column summary for each cleaned dataset."""
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