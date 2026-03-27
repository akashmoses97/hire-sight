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
    cleaned = str(role).strip()
    lowered = cleaned.lower()
    return ROLE_MAPPING.get(lowered, cleaned.title())


def process_yearly_trends(all_data):
    """
    Placeholder for yearly trends data processing
    Would process job market data grouped by year
    """
    # Sample yearly trends data
    return {
        'years': [2019, 2020, 2021, 2022, 2023],
        'hiring_rates': [0.15, 0.12, 0.08, 0.14, 0.18],
        'job_postings': [2000, 1800, 2200, 2500, 2800]
    }

def process_role_heatmap_data(all_data):
    """
    Process role-based selection/rejection rates from the recruitment dataset.
    """
    recruitment_df = all_data.get('ai_recruitment')
    if recruitment_df is None or recruitment_df.empty:
        return None

    required_columns = {'Role', 'decision'}
    if not required_columns.issubset(recruitment_df.columns):
        return None

    df = recruitment_df.loc[:, ['Role', 'decision']].copy()
    df['Role'] = df['Role'].astype(str).str.strip()
    df['decision'] = df['decision'].astype(str).str.strip().str.lower()
    df = df[(df['Role'] != '') & (df['decision'].isin(['select', 'reject']))]

    if df.empty:
        return None

    df['cleaned_role'] = df['Role'].apply(_normalize_role)

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
