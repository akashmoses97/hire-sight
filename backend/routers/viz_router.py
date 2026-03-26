from fastapi import APIRouter, HTTPException
from services.pipeline_service import process_pipeline_data, get_pipeline_by_filters, get_all_roles, get_all_companies, get_all_job_types, get_all_platforms
from services.timeline_service import process_timeline_data, get_timeline_by_filters
from services.trends_service import process_yearly_trends
from services.trends_service import process_role_heatmap_data
from data_store import all_data  # Import the global data

router = APIRouter()

@router.get("/pipeline")
async def pipeline_data(job_role: str = None, company_name: str = None, job_type: str = None, platform: str = None):
    """Get pipeline data for Sankey diagram with optional filters"""
    filters = {}
    if job_role and job_role != 'All':
        filters['job_role'] = job_role
    if company_name and company_name != 'All':
        filters['company_name'] = company_name
    if job_type and job_type != 'All':
        filters['job_type'] = job_type
    if platform and platform != 'All':
        filters['platform'] = platform

    if filters:
        data = get_pipeline_by_filters(all_data, filters)
    else:
        data = process_pipeline_data(all_data)

    if data:
        return data
    raise HTTPException(status_code=500, detail="Pipeline data not available")

@router.get("/pipeline/roles")
async def pipeline_roles():
    """Get list of available job roles from pipeline data"""
    return get_all_roles(all_data)

@router.get("/pipeline/companies")
async def pipeline_companies():
    """Get list of available companies from pipeline data"""
    return get_all_companies(all_data)

@router.get("/pipeline/job-types")
async def pipeline_job_types():
    """Get list of available job types from pipeline data"""
    return get_all_job_types(all_data)

@router.get("/pipeline/platforms")
async def pipeline_platforms():
    """Get list of available platforms from pipeline data"""
    return get_all_platforms(all_data)

@router.get("/timeline")
async def timeline_data(job_role: str = None, company_name: str = None, job_type: str = None, platform: str = None):
    """Get timeline data for application tracking over time with optional filters"""
    filters = {}
    if job_role and job_role != 'All':
        filters['job_role'] = job_role
    if company_name and company_name != 'All':
        filters['company_name'] = company_name
    if job_type and job_type != 'All':
        filters['job_type'] = job_type
    if platform and platform != 'All':
        filters['platform'] = platform

    if filters:
        data = get_timeline_by_filters(all_data, filters)
    else:
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

@router.get("/timeline/by-role/{role}")
async def timeline_by_role(role: str):
    """Get timeline data filtered by specific role"""
    from services.timeline_service import get_timeline_by_role

    data = get_timeline_by_role(all_data, role)
    if data:
        return data
    return {"timeline": []}