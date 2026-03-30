"""Hire Sight backend application entrypoint.

This file creates the FastAPI app, configures CORS, registers API routers,
and loads the shared datasets into the in-memory store during startup.
"""

import os
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
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data_router, prefix="/api", tags=["data"])
app.include_router(viz_router, prefix="/api", tags=["visualization"])

@app.on_event("startup")
async def startup_event():
    """Populate the shared dataset cache when the API boots.

    The startup hook respects the ``DATA_LOAD_ON_STARTUP`` environment flag,
    loads and cleans all configured datasets, and refreshes ``all_data`` so
    every route can read from the same in-memory state.
    """
    data_load_on_startup = os.getenv("DATA_LOAD_ON_STARTUP", "true").lower() == "true"
    if data_load_on_startup:
        try:
            print("Loading datasets on startup...")
            loaded_data = download_and_load_datasets()
            all_data.clear()
            all_data.update(loaded_data)
            print("Datasets loaded successfully")
        except Exception as e:
            print(f"Error loading datasets: {e}")
            all_data.clear()
    else:
        print("Data loading on startup is disabled")


@app.get("/")
async def root():
    """Return a lightweight API overview for health checks and discovery.

    This endpoint exposes a welcome message, the interactive docs path, and
    the main analytics/data routes expected by the frontend and developers.
    """
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
