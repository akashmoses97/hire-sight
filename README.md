
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
│       ├── kaggle_utils.py
│       └── kaggle_sources.py
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
  - **pipeline_service.py**: Processes pipeline data (Applications → Callbacks → Interviews → Offers) [1]
  - **timeline_service.py**: Manages application timeline data
  - **trends_service.py**: Handles yearly trends and role conversion rates [2]
- **utils/kaggle_sources.py**: Manages access to the Kaggle datasets [2]

### Frontend
- **components/Dashboard.js**: Main container integrating all visualizations
- **components/SankeyDiagram.js**: Visualizes job application flow through pipeline stages [1]
- **components/HeatMap.js**: Shows role-based conversion rates [2]
- **components/TimelineChart.js**: Displays application activity over time
- **components/YearlyTrendChart.js**: Presents hiring trends across years [2]
- **utils/api.js**: Handles backend API communication

## Data Flow
1. Backend processes Kaggle datasets [2]
2. API endpoints serve visualization-specific data
3. Frontend retrieves and renders data with D3.js
4. User filters (by role/year) update visualizations

This architecture separates data processing from visualization, supporting the project's goal of transforming job search tracking into structured visual exploration [1][2].

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up Kaggle API credentials:
   - Download your kaggle.json from your Kaggle account settings
   - Place it in ~/.kaggle/ directory (create if it doesn't exist)
   - Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

5. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```

6. Access the API documentation at http://localhost:8000/docs

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

- [Job Applications Tracker Dataset (Kaggle)](https://www.kaggle.com/datasets/prince7489/job-applications-tracker-dataset)
- [AI Recruitment Pipeline Dataset (Kaggle)](https://www.kaggle.com/datasets/yaswanthkumary/ai-recruitment-pipeline-dataset)
- [Job Market Insight Dataset (Kaggle)](https://www.kaggle.com/datasets/shaistashahid/job-market-insight)

## Tech Stack

- **Frontend**: React + D3.js
- **Backend**: Python with FastAPI
- **Data Processing**: Pandas for dataset manipulation

## Team Members

- Akash Moses Guttedar
- Darshnil Rana 
- Kanishk Chhabra
- Arunima Chowdhury