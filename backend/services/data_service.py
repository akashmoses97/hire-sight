"""Dataset loading service for backend startup.

This file coordinates optional dataset downloads, local CSV loading, and
cleaning so the rest of the backend can work with normalized DataFrames.
"""

from utils.data_utils import download_datasets, load_datasets
from utils.data_sources import get_all_datasets, get_dataset_info
from services.cleaning_service import clean_all_datasets

def download_and_load_datasets(download: bool = False):
    """Load the configured datasets and return cleaned DataFrames.

    When ``download`` is true, the function refreshes local CSV files before
    loading them. Raw inputs are then passed through the cleaning layer so
    callers receive normalized backend-ready datasets.
    """
    try:
        if download:
            download_datasets()
        raw_data = load_datasets()
        return clean_all_datasets(raw_data)
    except Exception as e:
        print(f"Error in download_and_load_datasets: {e}")
        return {}
        
def get_dataset_metadata():
    """Return metadata for every dataset configured in the project.

    The metadata comes from ``data_sources`` and includes descriptions,
    canonical file names, and remote identifiers used during download.
    """
    return get_all_datasets()
