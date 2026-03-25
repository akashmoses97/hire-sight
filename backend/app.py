from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import service placeholders
from services.data_service import download_and_load_datasets
from data_store import all_data
from routers.data_router import router as data_router
from routers.viz_router import router as viz_router

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

# Include routers
app.include_router(data_router, prefix="/api", tags=["data"])
app.include_router(viz_router, prefix="/api", tags=["visualization"])

@app.on_event("startup")
async def startup_event():
    """Load and clean datasets on startup."""
    try:
        loaded_data = download_and_load_datasets()
        all_data.clear()
        all_data.update(loaded_data)
    except Exception as e:
        print(f"Error loading datasets: {e}")
        all_data.clear()

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
            "/api/role-heatmap",
            "/api/data/job_applications",
            "/api/data/recruitment_data",
            "/api/data/job_market_data",
            "/api/data/all",
            "/api/data/summary"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)