from fastapi import APIRouter, HTTPException
from services.pipeline_service import process_pipeline_data, get_pipeline_by_role
from services.timeline_service import process_timeline_data, get_timeline_by_year
from services.trends_service import process_yearly_trends
from services.trends_service import process_role_heatmap_data
from data_store import all_data  # Import the global data

router = APIRouter()

@router.get("/pipeline")
async def pipeline_data():
    """Get pipeline data for Sankey diagram"""
    data = process_pipeline_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Pipeline data not available")

@router.get("/timeline")
async def timeline_data():
    """Get timeline data for application tracking over time"""
    data = process_timeline_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Timeline data not available")

@router.get("/yearly-trends")
async def yearly_trends():
    """Get yearly trend data for job market visualization"""
    data = process_yearly_trends(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Yearly trends data not available")

@router.get("/role-heatmap")
async def role_heatmap():
    """Get role-based conversion rate data for heatmap"""
    data = process_role_heatmap_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Role heatmap data not available")

# Additional filter endpoints
@router.get("/pipeline/by-role/{role}")
async def pipeline_by_role(role: str):
    """Get pipeline data filtered by specific role"""
    data = get_pipeline_by_role(all_data, role)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"No data found for role: {role}")

@router.get("/timeline/by-year/{year}")
async def timeline_by_year(year: int):
    """Get timeline data filtered by specific year"""
    data = get_timeline_by_year(all_data, year)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"No data found for year: {year}")