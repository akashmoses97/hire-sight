"""Pydantic models for backend API responses.

This file defines the structured response shapes used for pipeline and
timeline endpoints so payloads stay consistent across the backend.
"""

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


# Personalization models for F5 feature
class UserProfile(BaseModel):
    targetRole: str
    experienceLevel: str  # entry, mid, senior, lead
    jobType: str
    goals: List[str] = []  # visa_sponsorship, learning, salary_growth, quick_placement, remote
    industryFocus: Optional[str] = None
    expectedSalaryMin: Optional[int] = None
    currentApplications: Optional[int] = None
    currentCallbacks: Optional[int] = None
    currentInterviews: Optional[int] = None
    currentOffers: Optional[int] = None
    resumeSkills: Optional[List[str]] = None


class ResumeData(BaseModel):
    experience_years: Optional[int] = None
    skills: List[str] = []
    companies: List[str] = []
    roles: List[str] = []


class BenchmarkMetrics(BaseModel):
    avg_offer_rate: float = 0.0
    avg_callback_rate: float = 0.0
    avg_interview_rate: float = 0.0
    median_time_to_callback_days: Optional[int] = None
    median_time_to_offer_days: Optional[int] = None


class PredictedOutcomes(BaseModel):
    applications: int
    callbacks: int
    interviews: int
    offers: int
    offer_rate: float
    reasoning: str = ""


class LLMInsights(BaseModel):
    role_selection_advice: str
    timing_strategy: str
    volume_optimization: str
    experience_matching: str
    industry_focus: str
    confidence_score: float
    improvement_summary: str


class RecommendationResponse(BaseModel):
    user_metrics: Dict
    benchmark_metrics: BenchmarkMetrics
    predicted_outcomes: PredictedOutcomes
    llm_insights: LLMInsights
