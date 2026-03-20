from pydantic import BaseModel
from typing import Dict, List, Optional

# Define data models for structured API responses
class ConversionRates(BaseModel):
    app_to_callback: float
    callback_to_interview: float
    interview_to_offer: float

class RoleData(BaseModel):
    applications: int
    callbacks: int
    interviews: int
    offers: int

class PipelineData(BaseModel):
    applications: int
    callbacks: int
    interviews: int
    offers: int
    conversion_rates: ConversionRates
    by_role: Dict[str, RoleData]

class TimelineEntry(BaseModel):
    date: str
    applications: int
    callbacks: int
    interviews: int
    offers: int

class TimelineData(BaseModel):
    timeline: List[TimelineEntry]

# Add more models as needed for your visualizations