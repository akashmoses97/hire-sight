"""
Kaggle data sources for the Hire Sight project.
This file contains links and information about the datasets used in the project.
"""

# Dictionary containing information about each dataset
KAGGLE_DATASETS = {
    'job_applications': {
        'name': 'Job Applications Tracker Dataset',
        'path': 'prince7489/job-applications-tracker-dataset',
        'url': 'https://www.kaggle.com/datasets/prince7489/job-applications-tracker-dataset',
        'description': 'Dataset tracking job applications with stage progression information',
        'file': 'job_applications.csv'
    },
    'ai_recruitment': {
        'name': 'AI Recruitment Pipeline Dataset',
        'path': 'yaswanthkumary/ai-recruitment-pipeline-dataset',
        'url': 'https://www.kaggle.com/datasets/yaswanthkumary/ai-recruitment-pipeline-dataset',
        'description': 'Dataset containing AI recruitment pipeline information',
        'file': 'recruitment_data.csv'
    },
    'job_market': {
        'name': 'Job Market Insight Dataset',
        'path': 'shaistashahid/job-market-insight',
        'url': 'https://www.kaggle.com/datasets/shaistashahid/job-market-insight',
        'description': 'Dataset with job market trends and insights',
        'file': 'job_market_data.csv'
    }
}

def get_dataset_info(dataset_key):
    """
    Returns information about a specific dataset
    
    Args:
        dataset_key: Key for the dataset in the KAGGLE_DATASETS dictionary
        
    Returns:
        Dictionary containing dataset information or None if not found
    """
    return KAGGLE_DATASETS.get(dataset_key)

def get_all_datasets():
    """
    Returns information about all available datasets
    
    Returns:
        Dictionary containing all dataset information
    """
    return KAGGLE_DATASETS