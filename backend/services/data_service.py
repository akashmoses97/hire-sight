from utils.data_utils import download_datasets, load_datasets
from utils.data_sources import get_all_datasets, get_dataset_info
from services.cleaning_service import clean_all_datasets

def download_and_load_datasets(download: bool = False):
    """Load all datasets, optionally downloading fresh copies first, then clean them."""
    try:
        if download:
            download_datasets()
        raw_data = load_datasets()
        return clean_all_datasets(raw_data)
    except Exception as e:
        print(f"Error in download_and_load_datasets: {e}")
        return {}
        
def get_dataset_metadata():
    """Return metadata about all available datasets"""
    return get_all_datasets()