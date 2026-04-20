# Hire Sight

**Visual Analytics for the Tech Job Search Pipeline**
CSCE 679 · Team 3 · Texas A&M University

Hire Sight transforms the tech job search into a data-driven pipeline. It models the hiring funnel as **Applications → Callbacks → Interviews → Offers**, surfacing conversion rates, timing patterns, and personalised recommendations so you can search smarter — not harder.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://hire-sight-viz.vercel.app |
| Backend API | https://hire-sight-backend.onrender.com |
| API Docs | https://hire-sight-backend.onrender.com/docs |

---

## Features

### Pipeline Dashboard
Interactive Sankey funnel diagram showing how applications flow through each hiring stage. Filterable by role, company, job type, and platform — all updates happen in-place without resetting your scroll position.

- **Quick Highlights** — Four auto-computed cards (top company by volume, best-callback role, top platform, best job type) you can click to instantly apply a filter
- **Pipeline Summary** — Stage-level counts (Applications, Callbacks, Interviews, Offers)
- **Key Insights** — Auto-computed conversion rates: Callback Rate, Callback→Interview, Interview→Offer, and Overall Success Rate
- **Activity Timeline** — Monthly line chart tracking application volume across all stages

### Role Heatmap
D3 heatmap showing how each job role converts through the pipeline. Quickly spots which roles reach the interview stage most reliably.

### Yearly Trends
Bar/line chart showing job market posting trends year-over-year. Reveals hiring seasonality and growth patterns across the broader market.

### Personalised Recommendations (AI-Powered)
Enter your current pipeline metrics and target role; optionally upload your resume PDF. The backend parses your resume, benchmarks your stats against the dataset, and returns LLM-generated guidance on role fit, application volume, timing strategy, and experience matching.

### UI
- Light / dark mode toggle (persisted to localStorage)
- Fully responsive layout (4 → 2 → 1 column grids on mobile)
- Glassmorphism card aesthetic with animated gradient accents

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, D3.js 7, Axios, React Router 6, Bootstrap 5 |
| Backend | FastAPI, Uvicorn, Pandas, Pydantic, PyPDF |
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
│   ├── data/
│   │   ├── job_applications_tracker_dataset.csv   # Primary job tracking data
│   │   ├── dataset.csv                            # AI recruitment / interview decisions
│   │   └── job_market.csv                         # Job market trends & postings
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
| GET | `/yearly-trends` | Year-over-year job market posting trends |
| GET | `/role-heatmap` | Role × stage conversion rates for heatmap |

### Recommendations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/recommendations/analyze` | Accepts `profile_json` (form field) + optional `resume` (PDF). Returns user metrics, benchmarks, predicted outcomes, and LLM insights |

### Raw Data

| Method | Path | Description |
|--------|------|-------------|
| GET | `/data/job_applications` | Full job applications dataset as JSON |
| GET | `/data/recruitment_data` | AI recruitment dataset |
| GET | `/data/job_market_data` | Job market dataset |
| GET | `/data/all` | All three datasets |
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
```

**Frontend** — create `frontend/.env.local`:
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Data Pipeline

```
Google Drive CSVs
       ↓  (startup download via data_service.py)
Local data/ directory
       ↓  (cleaning_service.py)
Normalised Pandas DataFrames
       ↓  (data_store.py — global in-memory cache)
FastAPI services (pipeline, timeline, trends, recommendations)
       ↓  (REST JSON responses)
React + D3.js visualisations
```

### Datasets

| File | Description | Size |
|------|-------------|------|
| `job_applications_tracker_dataset.csv` | Per-application records with status, role, company, platform, job type | ~41 KB |
| `dataset.csv` | AI recruitment interview transcripts and hiring decisions | ~78 MB |
| `job_market.csv` | Job market postings with salary, skills, location, year | ~32 KB |

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

### Automatic (GitHub → main branch)
- Vercel rebuilds and redeploys the frontend on every push to `main`
- Render rebuilds and restarts the backend on every push to `main`

### Manual
- **Vercel**: Dashboard → Project → Deployments → Redeploy
- **Render**: Dashboard → Service → Manual Deploy

### Production Environment Variables

Set these in the respective hosting dashboards:

**Render (backend):**
```
DATA_LOAD_ON_STARTUP=true
ALLOWED_ORIGINS=https://hire-sight-viz.vercel.app
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

## Team

- Akash Moses Guttedar
- Darshnil Rana
- Kanishk Chhabra
- Arunima Chowdhury

CSCE 679 — Texas A&M University
