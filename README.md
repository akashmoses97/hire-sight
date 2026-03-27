
# Hire Sight

## Visual Analytics for the Tech Job Search Pipeline
**CSCE 679 Project - Team 3**

Hire Sight is an interactive dashboard for tech job search pipeline analytics. The system models the hiring pipeline as: Applications → Callbacks → Interviews → Offers, providing visual insights into conversion rates and hiring patterns.

## Background and Motivation

The technology job search is a multi-stage and high-volume process. Graduate students submit numerous applications without clear visibility into progression, conversion rates, or timelines. For many, especially international applicants, job outcomes impact visa status and career stability. Most students experience the job search as chaos with high volume applications and limited visibility.

Instead of just tracking the number of applications sent, we treat each transition between stages as a conversion rate. The idea is to treat the job search like an engineering pipeline.

## Research Questions

1. Where do applications drop off?
2. How do conversion rates vary across roles?
3. What are time-to-callback and time-to-offer metrics?
4. How do hiring patterns change across years?
5. How do job market trends correlate with offer rates?

## Features

- **Pipeline Visualization**: Sankey diagram showing job application flow from applications through offers
- **Role-based Analysis**: Heatmap showing conversion rates by role
- **Timeline Tracking**: Charts showing application activity over time
- **Yearly Trends**: Analysis of hiring patterns across years
- **Interactive Filters**: Filter data by role, company, job type, and platform

## 🚀 Deployment

### Production URLs
- **Frontend**: [https://hire-sight.vercel.app](https://hire-sight.vercel.app)
- **Backend API**: [https://hire-sight-backend.onrender.com](https://hire-sight-backend.onrender.com)

### Deployment Platforms
- **Frontend**: Vercel (React app)
- **Backend**: Render (FastAPI/Python)

## 🛠 Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 16+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables

#### Backend (.env or Render Environment Variables)
```bash
PYTHON_VERSION=3.12.0
DATA_LOAD_ON_STARTUP=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

#### Frontend (.env.local or Vercel Environment Variables)
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

## 📁 Project Structure

```
hire-sight/
├── .gitignore
├── README.md
├── backend/
│   ├── app.py                    # FastAPI application
│   ├── data_store.py             # Global data storage
│   ├── requirements.txt          # Python dependencies
│   ├── data/                     # CSV data files
│   ├── models/
│   │   └── data_models.py        # Pydantic models
│   ├── routers/
│   │   ├── data_router.py        # Raw data endpoints
│   │   └── viz_router.py         # Visualization endpoints
│   ├── services/
│   │   ├── cleaning_service.py   # Data cleaning utilities
│   │   ├── data_service.py       # Data loading service
│   │   ├── pipeline_service.py   # Pipeline analytics
│   │   ├── timeline_service.py   # Timeline analytics
│   │   └── trends_service.py     # Trends analytics
│   └── utils/
│       ├── data_sources.py       # Data source management
│       └── data_utils.py         # Data utilities
├── frontend/
│   ├── package.json
│   ├── .env.example              # Environment variables template
│   ├── vercel.json               # Vercel deployment config
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── App.css
│       ├── index.css
│       ├── components/
│       │   ├── Dashboard.js      # Main dashboard
│       │   ├── Home.js           # Homepage
│       │   ├── PipelinePage.js   # Pipeline visualization
│       │   ├── HeatmapPage.js    # Heatmap visualization
│       │   ├── TrendsPage.js     # Trends visualization
│       │   ├── SankeyDiagram.js  # Sankey chart component
│       │   ├── HeatMap.js        # Heatmap component
│       │   ├── TimelineChart.js  # Timeline chart
│       │   └── YearlyTrendChart.js # Yearly trends chart
│       └── utils/
│           └── api.js            # API client functions
```

## 🔌 API Endpoints

### Base URL
- **Local**: `http://localhost:8000/api`
- **Production**: `https://hire-sight-backend.onrender.com/api`

### Visualization Endpoints
- `GET /pipeline` - Job application pipeline data (with optional filters)
- `GET /timeline` - Timeline data for application tracking
- `GET /yearly-trends` - Yearly hiring trends
- `GET /role-heatmap` - Role-based conversion heatmap

### Filter Endpoints
- `GET /pipeline/roles` - Available job roles
- `GET /pipeline/companies` - Available companies
- `GET /pipeline/job-types` - Available job types
- `GET /pipeline/platforms` - Available platforms

### Data Endpoints
- `GET /data/job_applications` - Raw job applications data
- `GET /data/recruitment_data` - Raw recruitment data
- `GET /data/job_market_data` - Raw job market data
- `GET /data/all` - All datasets combined
- `GET /data/summary` - Dataset summary statistics

### Health Check
- `GET /` - API information and available endpoints

## 🧩 Component Architecture

### Backend Components
- **app.py**: FastAPI application with CORS setup and router configuration
- **data_store.py**: Global data storage using Python dictionaries
- **routers/viz_router.py**: Visualization API endpoints with filtering support
- **services/pipeline_service.py**: Pipeline analytics and Sankey diagram data
- **services/timeline_service.py**: Timeline chart data processing
- **services/trends_service.py**: Yearly trends and heatmap data
- **utils/data_utils.py**: Data downloading and loading from Google Drive

### Frontend Components
- **App.js**: Main React application with routing
- **Home.js**: Landing page with navigation
- **PipelinePage.js**: Main pipeline visualization with filters
- **SankeyDiagram.js**: D3.js Sankey diagram implementation
- **TimelineChart.js**: D3.js timeline chart implementation
- **HeatMap.js**: D3.js heatmap visualization
- **api.js**: Axios-based API client with error handling

## 🔧 Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data manipulation and analysis
- **Uvicorn**: ASGI server for FastAPI
- **Python-multipart**: File upload handling

### Frontend
- **React**: UI framework
- **D3.js**: Data visualization library
- **Axios**: HTTP client
- **React Router**: Client-side routing
- **Bootstrap**: CSS framework
- **Create React App**: Build tooling

### Deployment
- **Vercel**: Frontend hosting and CI/CD
- **Render**: Backend hosting and CI/CD
- **GitHub**: Version control and deployment triggers

## 📊 Data Pipeline

1. **Data Sources**: CSV files hosted on Google Drive
2. **Data Loading**: Automatic download and caching on startup
3. **Data Cleaning**: Pandas-based data preprocessing
4. **API Layer**: RESTful endpoints for data access
5. **Visualization**: D3.js charts for interactive analytics
6. **Filtering**: Real-time data filtering by multiple dimensions

## 🚀 Deployment Process

### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- Vercel rebuilds frontend, Render rebuilds backend
- Environment variables configured in respective dashboards

### Manual Deployment
- **Vercel**: Dashboard → Deployments → "Redeploy"
- **Render**: Dashboard → Service → "Manual Deploy"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Create a Pull Request

## 📝 License

This project is part of CSCE 679 coursework at Texas A&M University. 
- **components/TimelineChart.js**: Displays application activity over time
- **components/YearlyTrendChart.js**: Presents hiring trends across years 
- **utils/api.js**: Handles backend API communication

## Data Flow
1. Backend fetches and processes CSV datasets from Google Drive
2. API endpoints serve both raw data and processed visualization-specific data
3. Frontend homepage allows navigation to individual visualization pages
4. Each page retrieves and renders data with D3.js

This architecture separates data processing from visualization, supporting the project's goal of transforming job search tracking into structured visual exploration [1][2].

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```

5. Access the API documentation at http://localhost:8000/docs

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit http://localhost:3000

## Data Sources

- Job Applications Tracker Dataset (hosted on Google Drive)
- AI Recruitment Pipeline Dataset (hosted on Google Drive)
- Job Market Insight Dataset (hosted on Google Drive)

## Tech Stack

- **Frontend**: React + D3.js
- **Backend**: Python with FastAPI
- **Data Processing**: Pandas for dataset manipulation

## Team Members

- Akash Moses Guttedar
- Darshnil Rana 
- Kanishk Chhabra
- Arunima Chowdhury