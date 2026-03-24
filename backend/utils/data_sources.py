"""
Data sources for the Hire Sight project.
This file contains links and information about the datasets used in the project.
"""

# Dictionary containing information about each dataset
GOOGLE_DRIVE_DATASETS = {
    'job_applications': {
        'name': 'Job Applications Tracker Dataset',
        'gdrive_id': '12aCklFwpFnK2SrBdT7CY2ZyqTdYEqUrY',
        'description': 'Dataset tracking job applications with stage progression information',
        'file': 'job_applications.csv'
    },
    'ai_recruitment': {
        'name': 'AI Recruitment Pipeline Dataset',
        'gdrive_id': '1M840v881IYOHC3rhiSWTke0qEPlFLSNl',
        'description': 'Dataset containing AI recruitment pipeline information',
        'file': 'recruitment_data.csv'
    },
    'job_market': {
        'name': 'Job Market Insight Dataset',
        'gdrive_id': '1v-yFdjDHdmFmcwSLUgBUjQkeN4FENfzr',
        'description': 'Dataset with job market trends and insights',
        'file': 'job_market_data.csv'
    }
}

def get_dataset_info(dataset_key):
    """
    Returns information about a specific dataset
    
    Args:
        dataset_key: Key for the dataset in the GOOGLE_DRIVE_DATASETS dictionary
        
    Returns:
        Dictionary containing dataset information or None if not found
    """
    return GOOGLE_DRIVE_DATASETS.get(dataset_key)

def get_all_datasets():
    """
    Returns information about all available datasets
    
    Returns:
        Dictionary containing all dataset information
    """
    return GOOGLE_DRIVE_DATASETS