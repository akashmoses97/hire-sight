# Hire Sight

**Visual Analytics for the Tech Job Search Pipeline**
CSCE 679 · Team 3 · Texas A&M University

Hire Sight transforms the tech job search into a data-driven pipeline. It models the hiring funnel as **Applications -> Callbacks -> Interviews -> Offers**, surfacing conversion rates, timing patterns, and personalised recommendations so you can search smarter — not harder.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://hire-sight-viz.vercel.app |
| Backend API | https://hire-sight-backend.onrender.com |
| API Docs | https://hire-sight-backend.onrender.com/docs |

---

## Features

### F1 & F3 : Pipeline Dashboard
Interactive Sankey funnel diagram showing how applications flow through each hiring stage. Filterable by role, company, job type, and platform — all updates happen in-place without resetting your scroll position.

- **Quick Highlights** — Four auto-computed cards (top company by volume, best-callback role, top platform, best job type) you can click to instantly apply a filter
- **Pipeline Summary** — Stage-level counts (Applications, Callbacks, Interviews, Offers)
- **Key Insights** — Auto-computed conversion rates: Callback Rate, Callback->Interview, Interview->Offer, and Overall Success Rate
- **Activity Timeline** — Monthly line chart tracking application volume across all stages

### F2 : Role & Reason Heatmaps
Two D3 heatmaps drawn from the AI recruitment dataset, displayed on the same page:

- **Role Heatmap** — Selection and rejection rates broken down by normalised job role
- **Reason Heatmap** — Selection and rejection rates broken down by decision reason (e.g. experience match, skills gap)

### F4 : Yearly Trends
Bar/line chart showing job market posting trends year-over-year. Filterable by job title, company, location, job type, experience level, salary band, and remote-only status. Reveals hiring seasonality and growth patterns across the broader market.

### F5 : Personalised Recommendations (AI-Powered)
Enter your current pipeline metrics and target role; optionally upload your resume PDF. The backend parses your resume, benchmarks your stats against the dataset, and returns LLM-generated guidance on role fit, application volume, timing strategy, and experience matching. Requires `HF_API_KEY` to call the Hugging Face model; falls back to data-driven recommendations when the key is absent.

### UI Style - 
- Light / dark mode toggle (persisted to localStorage)
- Fully responsive layout (4 -> 2 -> 1 column grids on mobile)
- Glassmorphism card aesthetic with animated gradient accents

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, D3.js 7, d3-sankey, Axios, React Router 6, Bootstrap 5 |
| Backend | FastAPI, Uvicorn, Pandas, Pydantic, PyPDF, python-dotenv, python-multipart |
| LLM | Hugging Face Inference API (Mistral-7B-Instruct-v0.1 by default); falls back to data-driven recommendations |
| Deployment | Vercel (frontend), Render (backend) |
| Data | CSV files loaded at startup into an in-memory Pandas cache |

---

## Project Structure

```
hire-sight/
├── README.md
├── .gitignore
├── backend/
│   ├── app.py                          # FastAPI app, CORS, router registration, startup event
│   ├── data_store.py                   # Global in-memory dataset cache (dict of DataFrames)
│   ├── render.yaml                     # Render deployment config (Python 3.12, uvicorn)
│   ├── requirements.txt
│   ├── scripts/
│   │   └── prepare_yearly_trends_job_market.py  # One-off script to pre-process job market CSV for trends
│   ├── data/
│   │   ├── job_applications_tracker_dataset.csv   # Primary job tracking data
│   │   ├── dataset.csv                            # AI recruitment / interview decisions
│   │   ├── job_market.csv                         # Job market postings (raw; fallback for trends)
│   │   └── yearly_trends_job_market.csv           # Engineering Jobs Insight Dataset (powers Yearly Trends page)
│   ├── models/
│   │   └── data_models.py              # Pydantic response models
│   ├── routers/
│   │   ├── viz_router.py               # Pipeline, timeline, trends, heatmap, highlights endpoints
│   │   ├── data_router.py              # Raw dataset access endpoints
│   │   └── recommendations_router.py  # Personalised recommendations (profile + resume upload)
│   ├── services/
│   │   ├── pipeline_service.py         # Stage totals, conversion rates, per-role breakdown, highlights
│   │   ├── timeline_service.py         # Monthly stage aggregation
│   │   ├── trends_service.py           # Yearly trends & role heatmap
│   │   ├── personalization_service.py  # Benchmark comparison & outcome prediction
│   │   ├── llm_service.py              # LLM-generated recommendations
│   │   ├── resume_service.py           # PDF resume parsing (skills, roles, experience)
│   │   ├── cleaning_service.py         # Data normalisation, status mapping, stage indicators
│   │   └── data_service.py             # Dataset download and load orchestration
│   └── utils/
│       ├── data_sources.py             # Google Drive dataset metadata
│       └── data_utils.py               # CSV download & DataFrame loading
└── frontend/
    ├── package.json
    ├── .env.example
    ├── vercel.json                     # Vercel SPA rewrite config
    └── src/
        ├── App.js                      # Router, theme toggle (light/dark)
        ├── App.css                     # Global styles and all component CSS (pp-* namespace)
        ├── index.js
        ├── components/
        │   ├── Home.js                         # Landing page — 5 feature cards
        │   ├── PipelinePage.js                 # Main dashboard (Sankey + filters + insights)
        │   ├── HeatmapPage.js                  # Role conversion heatmap page
        │   ├── TrendsPage.js                   # Yearly trends page
        │   ├── RecommendationsPage.js          # Personalised recommendations page
        │   ├── SankeyDiagram.js                # D3 Sankey flow diagram
        │   ├── HeatMap.js                      # D3 role × stage heatmap
        │   ├── TimelineChart.js                # D3 monthly activity line chart
        │   ├── YearlyTrendChart.js             # D3 yearly trends chart
        │   ├── PersonalizationModal.js         # Profile input form
        │   ├── PersonalizationVisuals.js       # Before/after comparison charts
        │   ├── RecommendationCards.js          # LLM insight display cards
        │   ├── BeforeAfterComparison.js        # Side-by-side metrics comparison
        │   ├── ImprovementSummary.js           # Projected improvement summary
        │   └── Dashboard.js                    # Legacy dashboard component
        └── utils/
            └── api.js                          # Axios API client (all endpoint helpers)
```

---

## API Endpoints

Base URL — Local: `http://localhost:8000/api` · Production: `https://hire-sight-backend.onrender.com/api`

### Visualization

| Method | Path | Description |
|--------|------|-------------|
| GET | `/pipeline` | Sankey data — stage totals + conversion rates. Query params: `job_role`, `company_name`, `job_type`, `platform` |
| GET | `/pipeline/highlights` | Top entry per dimension (company by volume, role/platform/job-type by conversion rate) |
| GET | `/pipeline/roles` | Distinct job roles for filter dropdown |
| GET | `/pipeline/companies` | Distinct companies for filter dropdown |
| GET | `/pipeline/job-types` | Distinct job types for filter dropdown |
| GET | `/pipeline/platforms` | Distinct platforms for filter dropdown |
| GET | `/pipeline/by-role/{role}` | Pipeline metrics for a single role |
| GET | `/timeline` | Monthly stage counts. Same query params as `/pipeline` |
| GET | `/timeline/by-year/{year}` | Monthly timeline for one calendar year |
| GET | `/timeline/by-role/{role}` | Timeline filtered to one role |
| GET | `/yearly-trends` | Year-over-year job market posting trends. Query params: `job_title`, `company`, `location`, `job_type`, `experience_bucket`, `salary_bucket`, `remote_only`, `top_n` |
| GET | `/yearly-trends/options` | Normalised filter options (job titles, companies, locations, etc.) for the trends page dropdowns |
| GET | `/role-heatmap` | Selection and rejection rates by normalised job role (AI recruitment dataset) |
| GET | `/reason-heatmap` | Selection and rejection rates by decision reason (AI recruitment dataset) |

### Recommendations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/recommendations/analyze` | Accepts `profile_json` (form field) + optional `resume` (PDF). Returns `user_metrics`, `benchmark_metrics`, `predicted_outcomes`, `role_analysis`, `timing_analysis`, `llm_insights`, and `metadata` (source model, resume parsed flag) |

### Raw Data

| Method | Path | Description |
|--------|------|-------------|
| GET | `/data/job_applications` | Full job applications dataset as JSON |
| GET | `/data/recruitment_data` | AI recruitment dataset |
| GET | `/data/job_market_data` | Job market dataset |
| GET | `/data/all` | All four datasets |
| GET | `/data/summary` | Row counts and column names per dataset |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info and available endpoint list |

---

## Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Interactive API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

Opens at `http://localhost:3000`

### Environment Variables

**Backend** — create `backend/.env`:
```bash
DATA_LOAD_ON_STARTUP=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
HF_API_KEY=your_huggingface_api_key        # required for AI recommendations
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1  # optional; this is the default
```

**Frontend** — create `frontend/.env.local`:
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Data Pipeline

```
Google Drive CSVs (job_applications, ai_recruitment, job_market)
       ↓  (startup download via data_service.py)
     +  yearly_trends_job_market.csv  ← local file, not downloaded
       ↓
Local data/ directory
       ↓  (cleaning_service.py)
Normalised Pandas DataFrames
       ↓  (data_store.py — global in-memory cache)
FastAPI services (pipeline, timeline, trends, recommendations)
       ↓  (REST JSON responses)
React + D3.js visualisations
```

### Datasets

| File | Description | Used by |
|------|-------------|---------|
| `job_applications_tracker_dataset.csv` | Per-application records with status, role, company, platform, job type | Pipeline dashboard, Timeline chart |
| `dataset.csv` | AI recruitment interview transcripts and hiring decisions | Role Heatmap, Reason Heatmap |
| `yearly_trends_job_market.csv` | Engineering Jobs Insight Dataset — job postings with salary, skills, location, year | Yearly Trends page |
| `job_market.csv` | Legacy job market postings dataset | Raw data endpoint (`/data/job_market_data`); fallback for trends if `yearly_trends_job_market.csv` is absent |

**Sources**

- \[1\] [Job Applications Tracker Dataset](https://www.kaggle.com/datasets/prince7489/job-applications-tracker-dataset) — Kaggle
- \[2\] [AI Recruitment Pipeline Dataset](https://www.kaggle.com/datasets/yaswanthkumary/ai-recruitment-pipeline-dataset) — Kaggle
- \[3\] [Engineering Jobs Insight Dataset](https://huggingface.co/datasets/yiqing111/Engineering_Jobs_Insight_Dataset) — Hugging Face

### Stage Mapping

Each job application row is mapped to binary stage indicators:

| Stage | Status values that count as `1` |
|-------|--------------------------------|
| Application | Every row |
| Callback | Assessment Pending, Phone Screen, Interview Scheduled, Selected, Rejected |
| Interview | Interview Scheduled, Selected |
| Offer | Selected |

---

## Deployment

### Automatic (GitHub -> main branch)
- Vercel rebuilds and redeploys the frontend on every push to `main`
- Render rebuilds and restarts the backend on every push to `main`

### Manual
- **Vercel**: Dashboard -> Project -> Deployments -> Redeploy
- **Render**: Dashboard -> Service -> Manual Deploy

### Production Environment Variables

Set these in the respective hosting dashboards:

**Render (backend):**
```
DATA_LOAD_ON_STARTUP=true
ALLOWED_ORIGINS=https://hire-sight-viz.vercel.app
HF_API_KEY=your_huggingface_api_key
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

**Vercel (frontend):**
```
REACT_APP_API_URL=https://hire-sight-backend.onrender.com/api
```

---

## Contributing

```bash
git checkout -b feature/your-feature
# make changes
git commit -m "feat: description"
git push origin feature/your-feature
# open a Pull Request against main
```

---

## Future Work

- **Stronger linked navigation between views** — Use cross-highlighting, shared selections, and guided transitions so users can move naturally from overview to bottleneck analysis, role comparison, time patterns, and recommendations.
- **More coherent heatmap design** — Clarify the relationship between the two heatmaps through shared legends, synchronized filters, explanatory captions, and linked drill-down behaviour.
- **Richer bottleneck narratives** — Augment the Pipeline Dashboard with explanatory annotations, role-specific company drill-downs, and context panels that explain why a particular transition is important.
- **Survey-first storytelling** — Use survey and profile responses to drive the initial state of the system so that users enter directly into a tailored analytical story rather than a generic dashboard.
- **Application-level tracking** — Move from static public datasets to richer, user-entered application histories so the system can support personal job tracking and more realistic Sankey flows.
- **Resume-aware personalization** — Extend the recommendation layer with resume or skill-gap analysis so AI guidance is more grounded and actionable.
- **Bias audit and dataset expansion** — Perform a formal audit of the datasets used, document representational limits, and search for richer company-application datasets.

---

## Feedback

We'd love to hear your thoughts on Hire Sight. Please fill out our short feedback form:

**[Share Feedback](https://docs.google.com/forms/d/1lbYMDdpPm9rFTKFpFgbag34-tKaDgV3ofcUjeIDPN3s/edit)**

---

## Team

- Akash Moses Guttedar
- Darshnil Rana
- Kanishk Chhabra
- Arunima Chowdhury

CSCE 679 — Texas A&M University
