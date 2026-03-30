"""Dataset source metadata definitions.

This module lists the datasets used by Hire Sight along with file names,
descriptions, and Google Drive identifiers needed for loading or download.
"""

# Dictionary containing information about each dataset
KAGGLE_DATASETS = {
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
    """Return metadata for one configured dataset key.

    Parameters
    ----------
    dataset_key:
        Key used in ``KAGGLE_DATASETS`` such as ``job_applications``.

    Returns
    -------
    dict | None
        Dataset metadata when the key exists, otherwise ``None``.
    """
    return KAGGLE_DATASETS.get(dataset_key)

def get_all_datasets():
    """Return metadata for every dataset configured in the project.

    The returned dictionary is used by higher-level services that need to
    inspect available sources without hardcoding dataset details.
    """
    return KAGGLE_DATASETS
