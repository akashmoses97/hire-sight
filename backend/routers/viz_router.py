"""Visualization routes for analytics endpoints.

This router serves the processed payloads used by the frontend charts,
including pipeline, timeline, yearly trends, and role heatmap views.
"""

from fastapi import APIRouter, HTTPException
from services.pipeline_service import process_pipeline_data, get_pipeline_by_filters, get_all_roles, get_all_companies, get_all_job_types, get_all_platforms
from services.timeline_service import process_timeline_data, get_timeline_by_filters
from services.trends_service import process_yearly_trends
from services.trends_service import process_role_heatmap_data
from data_store import all_data  # Import the global data

router = APIRouter()

@router.get("/pipeline")
async def pipeline_data(job_role: str = None, company_name: str = None, job_type: str = None, platform: str = None):
    """Return pipeline metrics for the Sankey visualization.

    Optional query parameters narrow the application dataset by role,
    company, job type, and platform before the service computes stage totals
    and conversion rates for the frontend.
    """
    filters = {}
    # Only forward meaningful filters so the service can treat "All" as the
    # unfiltered dashboard state.
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
    """Return distinct job roles that can be used in pipeline filters."""
    return get_all_roles(all_data)

@router.get("/pipeline/companies")
async def pipeline_companies():
    """Return distinct company names that can be used in pipeline filters."""
    return get_all_companies(all_data)

@router.get("/pipeline/job-types")
async def pipeline_job_types():
    """Return distinct job types that can be used in pipeline filters."""
    return get_all_job_types(all_data)

@router.get("/pipeline/platforms")
async def pipeline_platforms():
    """Return distinct application platforms that can be used in filters."""
    return get_all_platforms(all_data)

@router.get("/timeline")
async def timeline_data(job_role: str = None, company_name: str = None, job_type: str = None, platform: str = None):
    """Return monthly pipeline activity for the timeline chart.

    The endpoint applies the same filter dimensions as the Sankey view and
    returns per-month stage counts for applications, callbacks, interviews,
    and offers.
    """
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
    """Return yearly job market trend data for the frontend trends page.

    The response contains posting totals and year-over-year growth values
    derived from the cleaned job market dataset.
    """
    data = process_yearly_trends(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Yearly trends data not available")

@router.get("/role-heatmap")
async def role_heatmap():
    """Return role-based selection and rejection rates for the heatmap view.

    The backend summarizes cleaned recruitment decisions by normalized role
    labels so the frontend can render comparative outcome percentages.
    """
    data = process_role_heatmap_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Role heatmap data not available")

# Additional filter endpoints
@router.get("/pipeline/by-role/{role}")
async def pipeline_by_role(role: str):
    """Return pipeline metrics for a single role path parameter.

    This route is mainly useful for direct inspection or testing when a
    caller wants the pipeline payload for one role without other filters.
    """
    data = get_pipeline_by_role(all_data, role)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"No data found for role: {role}")

@router.get("/timeline/by-year/{year}")
async def timeline_by_year(year: int):
    """Return monthly timeline metrics restricted to one calendar year.

    The response preserves monthly stage totals for the requested year and
    returns a 404 when no matching application records are available.
    """
    data = get_timeline_by_year(all_data, year)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"No data found for year: {year}")

@router.get("/timeline/by-role/{role}")
async def timeline_by_role(role: str):
    """Return timeline data for a single role name.

    The route delegates role filtering to the timeline service and falls back
    to an empty timeline payload when the selected role has no matches.
    """
    from services.timeline_service import get_timeline_by_role

    data = get_timeline_by_role(all_data, role)
    if data:
        return data
    return {"timeline": []}
