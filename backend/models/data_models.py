"""Pydantic models for backend API responses.

This file defines the structured response shapes used for pipeline and
timeline endpoints so payloads stay consistent across the backend.
"""

from pydantic import BaseModel
from typing import Dict, List, Optional

# Pipeline visualization models
class ConversionRates(BaseModel):
    """Stage-to-stage conversion rate fractions for the pipeline view."""

    app_to_callback: float
    callback_to_interview: float
    interview_to_offer: float

class RoleData(BaseModel):
    """Application stage counts for a single job role."""

    applications: int
    callbacks: int
    interviews: int
    offers: int

class PipelineData(BaseModel):
    """Full pipeline payload: totals, conversion rates, and per-role breakdown."""

    applications: int
    callbacks: int
    interviews: int
    offers: int
    conversion_rates: ConversionRates
    by_role: Dict[str, RoleData]

class TimelineEntry(BaseModel):
    """Monthly stage counts for one calendar period."""

    date: str
    applications: int
    callbacks: int
    interviews: int
    offers: int

class TimelineData(BaseModel):
    """Ordered list of monthly stage counts for the timeline chart."""

    timeline: List[TimelineEntry]


# Personalization models for F5 feature
class UserProfile(BaseModel):
    """User inputs collected by the recommendations form."""

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
    """Structured fields extracted from a parsed resume PDF."""

    experience_years: Optional[int] = None
    skills: List[str] = []
    companies: List[str] = []
    roles: List[str] = []


class BenchmarkMetrics(BaseModel):
    """Market-average conversion rates for the user's target role."""

    avg_offer_rate: float = 0.0
    avg_callback_rate: float = 0.0
    avg_interview_rate: float = 0.0
    median_time_to_callback_days: Optional[int] = None
    median_time_to_offer_days: Optional[int] = None


class PredictedOutcomes(BaseModel):
    """Projected pipeline stage counts after applying recommendations."""

    applications: int
    callbacks: int
    interviews: int
    offers: int
    offer_rate: float
    reasoning: str = ""


class LLMInsights(BaseModel):
    """Structured output fields returned by the LLM recommendations prompt."""

    role_selection_advice: str
    timing_strategy: str
    volume_optimization: str
    experience_matching: str
    industry_focus: str
    confidence_score: float
    improvement_summary: str


class RecommendationResponse(BaseModel):
    """Top-level recommendations response envelope."""

    user_metrics: Dict
    benchmark_metrics: BenchmarkMetrics
    predicted_outcomes: PredictedOutcomes
    llm_insights: LLMInsights
