from fastapi import APIRouter, HTTPException
from data_store import all_data  # Import the global data

router = APIRouter()

@router.get("/data/job_applications")
async def get_job_applications_data():
    """Get raw job applications data"""
    if 'job_applications' in all_data and all_data['job_applications'] is not None:
        return all_data['job_applications'].to_dict('records')
    raise HTTPException(status_code=500, detail="Job applications data not available")

@router.get("/data/recruitment_data")
async def get_recruitment_data():
    """Get raw AI recruitment pipeline data"""
    if 'ai_recruitment' in all_data and all_data['ai_recruitment'] is not None:
        return all_data['ai_recruitment'].to_dict('records')
    raise HTTPException(status_code=500, detail="Recruitment data not available")

@router.get("/data/job_market_data")
async def get_job_market_data():
    """Get raw job market insight data"""
    if 'job_market' in all_data and all_data['job_market'] is not None:
        return all_data['job_market'].to_dict('records')
    raise HTTPException(status_code=500, detail="Job market data not available")

@router.get("/data/all")
async def get_all_data():
    """Get all raw datasets"""
    result = {}
    for key, df in all_data.items():
        if df is not None:
            result[key] = df.to_dict('records')
        else:
            result[key] = []
    return result