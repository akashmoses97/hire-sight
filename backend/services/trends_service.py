"""Trend and heatmap analytics service.

This module transforms job market and recruitment datasets into yearly trend
series and role-based outcome summaries for the frontend visualizations.
"""

ROLE_MAPPING = {
    "data analyst": "Data Analyst",
    "data engineer": "Data Engineer",
    "data scientist": "Data Scientist",
    "data architect": "Data Architect",
    "software engineer": "Software Engineer",
    "software developer": "Software Engineer",
    "full stack developer": "Full Stack Developer",
    "ai engineer": "ML/AI Engineer",
    "machine learning engineer": "ML/AI Engineer",
    "ai researcher": "AI Researcher",
    "ui designer": "UI/UX Designer",
    "ux designer": "UI/UX Designer",
    "ui/ux designer": "UI/UX Designer",
    "cybersecurity analyst": "Cybersecurity",
    "cybersecurity specialist": "Cybersecurity",
    "cloud engineer": "Cloud Engineering",
    "cloud architect": "Cloud Engineering",
    "hr specialist": "HR Specialist",
    "human resources specialist": "HR Specialist",
    "product manager": "Product Manager",
    "project manager": "Project Manager",
    "qa engineer": "QA Engineer",
    "network engineer": "Network Engineer",
    "system administrator": "System Administrator",
    "database administrator": "Database Administrator",
    "devops engineer": "DevOps Engineer",
    "mobile app developer": "Mobile App Developer",
    "game developer": "Game Developer",
    "graphic designer": "Graphic Designer",
    "content writer": "Content Writer",
    "digital marketing specialist": "Digital Marketing Specialist",
    "e-commerce specialist": "E-commerce Specialist",
    "business analyst": "Business Analyst",
    "robotics engineer": "Robotics Engineer",
    "ar/vr developer": "AR/VR Developer",
    "it support specialist": "IT Support Specialist",
    "ui engineer": "UI Engineer",
}

def _normalize_role(role):
    """Normalize a raw recruitment role into a display-friendly category.

    Known role variants are collapsed into a smaller shared taxonomy so the
    heatmap groups similar positions together instead of splitting counts.
    """
    cleaned = str(role).strip()
    lowered = cleaned.lower()
    return ROLE_MAPPING.get(lowered, cleaned.title())
from services.cleaning_service import get_stage_metrics

def _safe_rate(numerator: int, denominator: int) -> float:
    """Return a rounded ratio while protecting against empty denominators.

    The helper keeps analytics code concise anywhere a percentage may need to
    be computed from grouped counts.
    """
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)

def process_yearly_trends(all_data):
    """Build the yearly hiring trends payload from job market postings.

    The output contains sorted years, posting totals, and period-over-period
    growth rates for use in the frontend yearly trends view.
    """
    job_market = all_data.get("job_market")
    if job_market is None or job_market.empty or "year" not in job_market.columns:
        return {"years": [], "hiring_rates": [], "job_postings": []}

    grouped = (
        job_market.groupby("year", as_index=False)
        .agg(job_postings=("job_title", "count"))
        .sort_values("year")
    )

    grouped["hiring_rate"] = grouped["job_postings"].pct_change().fillna(0.0)

    return {
        "years": [int(year) for year in grouped["year"].tolist()],
        "hiring_rates": [round(float(rate), 4) for rate in grouped["hiring_rate"].tolist()],
        "job_postings": [int(count) for count in grouped["job_postings"].tolist()],
    }


def process_role_heatmap_data(all_data):
    """Build role-level selection and rejection metrics for the heatmap.

    Recruitment rows are normalized to a consistent role taxonomy, filtered to
    select/reject decisions, aggregated by role, and converted into counts and
    percentages that the frontend can visualize directly.
    """
    recruitment_df = all_data.get('ai_recruitment')
    if recruitment_df is None or recruitment_df.empty:
        return None

    columns = {column.lower(): column for column in recruitment_df.columns}
    role_column = columns.get('role')
    decision_column = columns.get('decision')

    if role_column is None or decision_column is None:
        return None

    df = recruitment_df.loc[:, [role_column, decision_column]].copy()
    df.columns = ['Role', 'decision']

    df['Role'] = df['Role'].astype(str).str.strip()
    df['decision'] = df['decision'].astype(str).str.strip().str.lower()
    df = df[(df['Role'] != '') & (df['decision'].isin(['select', 'reject']))]

    if df.empty:
        return None

    df['cleaned_role'] = df['Role'].apply(_normalize_role)

    # Count raw outcomes first, then derive rates so the response can expose
    # both percentages and absolute sample sizes for each role.
    counts = (
        df.groupby(['cleaned_role', 'decision'])
        .size()
        .unstack(fill_value=0)
        .reindex(columns=['select', 'reject'], fill_value=0)
    )

    totals = counts.sum(axis=1)
    rates = counts.div(totals, axis=0).fillna(0)
    rates = rates.sort_values(by='select', ascending=False)

    data = []
    for role, row in rates.iterrows():
        selected_count = int(counts.loc[role, 'select'])
        rejected_count = int(counts.loc[role, 'reject'])
        total = int(totals.loc[role])
        data.append({
            'role': role,
            'selected_rate': round(float(row['select']), 4),
            'rejected_rate': round(float(row['reject']), 4),
            'selected_count': selected_count,
            'rejected_count': rejected_count,
            'total': total,
        })

    return {
        'outcomes': ['Selected %', 'Rejected %'],
        'data': data,
    }
