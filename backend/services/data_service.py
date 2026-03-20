from utils.kaggle_utils import download_datasets, load_datasets
from utils.kaggle_sources import get_all_datasets, get_dataset_info

def download_and_load_datasets():
    """Download and load all datasets from Kaggle"""
    try:
        download_datasets()
        return load_datasets()
    except Exception as e:
        print(f"Error in download_and_load_datasets: {e}")
        return {}
        
def get_dataset_metadata():
    """Return metadata about all available datasets"""
    return get_all_datasets()