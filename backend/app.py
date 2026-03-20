from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import service placeholders
from services.data_service import download_and_load_datasets
from services.pipeline_service import process_pipeline_data, get_pipeline_by_role
from services.timeline_service import process_timeline_data, get_timeline_by_year
from services.trends_service import process_yearly_trends, process_role_heatmap_data

app = FastAPI(
    title="Hire Sight API",
    description="API for the Hire Sight job search pipeline analytics",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage for sample data
all_data = {}

@app.on_event("startup")
async def startup_event():
    """Load datasets on startup - placeholder for Kaggle integration"""
    global all_data
    try:
        # Placeholder: This would download and load Kaggle datasets
        # For now, we'll use sample data
        all_data = download_and_load_datasets()
    except Exception as e:
        print(f"Error loading datasets: {e}")
        all_data = {}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Hire Sight API",
        "documentation": "/docs",
        "available_endpoints": [
            "/api/pipeline",
            "/api/timeline", 
            "/api/yearly-trends",
            "/api/role-heatmap"
        ]
    }

@app.get("/api/pipeline")
async def pipeline_data():
    """Get pipeline data for Sankey diagram"""
    data = process_pipeline_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Pipeline data not available")

@app.get("/api/timeline")
async def timeline_data():
    """Get timeline data for application tracking over time"""
    data = process_timeline_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Timeline data not available")

@app.get("/api/yearly-trends")
async def yearly_trends():
    """Get yearly trend data for job market visualization"""
    data = process_yearly_trends(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Yearly trends data not available")

@app.get("/api/role-heatmap")
async def role_heatmap():
    """Get role-based conversion rate data for heatmap"""
    data = process_role_heatmap_data(all_data)
    if data:
        return data
    raise HTTPException(status_code=500, detail="Role heatmap data not available")

# Additional filter endpoints
@app.get("/api/pipeline/by-role/{role}")
async def pipeline_by_role(role: str):
    """Get pipeline data filtered by specific role"""
    data = get_pipeline_by_role(all_data, role)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"No data found for role: {role}")

@app.get("/api/timeline/by-year/{year}")
async def timeline_by_year(year: int):
    """Get timeline data filtered by specific year"""
    data = get_timeline_by_year(all_data, year)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"No data found for year: {year}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)