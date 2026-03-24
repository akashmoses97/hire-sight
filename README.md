
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


# Project Structure and Responsibilities

## Project Organization
```
hiresight/
├── .gitignore
├── README.md
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── data/
│   │   └── .gitkeep
│   ├── models/
│   │   └── data_models.py
│   ├── services/
│   │   ├── data_service.py
│   │   ├── pipeline_service.py
│   │   ├── timeline_service.py
│   │   └── trends_service.py
│   └── utils/
│       ├── data_sources.py
│       └── data_utils.py
├── frontend/
│   ├── package.json
│   ├── .gitignore
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── App.css
│       ├── index.css
│       ├── components/
│       │   ├── Dashboard.js
│       │   ├── SankeyDiagram.js
│       │   ├── HeatMap.js
│       │   ├── TimelineChart.js
│       │   └── YearlyTrendChart.js
│       └── utils/
│           └── api.js
```

## Component Responsibilities

### Backend
- **app.py**: FastAPI application defining API endpoints for the job pipeline visualizations [1]
- **models/data_models.py**: Defines data structures for API responses
- **services/**:
  - **pipeline_service.py**: Processes pipeline data (Applications → Callbacks → Interviews → Offers) 
  - **timeline_service.py**: Manages application timeline data
  - **trends_service.py**: Handles yearly trends and role conversion rates 
- **utils/data_sources.py**: Manages access to data sources from Google Drive

### Frontend
- **components/Home.js**: Homepage with navigation tiles to different visualizations
- **components/PipelinePage.js**: Page displaying job search pipeline (Sankey diagram and timeline)
- **components/HeatmapPage.js**: Page displaying role-based conversion heatmap
- **components/TrendsPage.js**: Page displaying yearly hiring trends
- **components/SankeyDiagram.js**: Visualizes job application flow through pipeline stages 
- **components/HeatMap.js**: Shows role-based conversion rates 
- **components/TimelineChart.js**: Displays application activity over time
- **components/YearlyTrendChart.js**: Presents hiring trends across years 
- **utils/api.js**: Handles backend API communication

## Data Flow
1. Backend fetches and processes CSV datasets from Google Drive
2. API endpoints serve visualization-specific data
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