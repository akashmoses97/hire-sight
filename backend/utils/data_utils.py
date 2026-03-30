"""Low-level dataset download and file loading utilities.

This file handles pulling CSV files from remote sources, locating local
fallback files, and loading the available datasets into pandas DataFrames.
"""

import os
import pandas as pd
import requests
from utils.data_sources import KAGGLE_DATASETS

# Replace the hardcoded datasets dictionary with:
datasets = KAGGLE_DATASETS
# Paths for data storage
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

LOCAL_FILE_FALLBACKS = {
    'job_applications': ['job_applications_tracker_dataset.csv', 'job_applications.csv'],
    'ai_recruitment': ['dataset.csv', 'recruitment_data.csv'],
    'job_market': ['job_market.csv', 'job_market_data.csv']
}

def download_datasets():
    """Download configured datasets into the local backend data directory.

    For each dataset, the downloader prefers an already-present local file
    path when one exists so refreshed content lands in the same location used
    by the current project setup.
    """
    for key, dataset in datasets.items():
        # Determine the target file path: use existing local file if available, else primary
        candidates = [dataset.get('file')] + LOCAL_FILE_FALLBACKS.get(key, [])
        existing_path = None
        for candidate in candidates:
            if not candidate:
                continue
            candidate_path = os.path.join(DATA_DIR, candidate)
            if os.path.exists(candidate_path):
                existing_path = candidate_path
                break
        
        if existing_path:
            file_path = existing_path
        else:
            file_path = os.path.join(DATA_DIR, dataset['file'])
        
        url = f"https://drive.google.com/uc?export=download&id={dataset['gdrive_id']}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {key} dataset to {file_path}")
        except Exception as e:
            print(f"Error downloading {key}: {e}")
        
def load_datasets():
    """Load all configured datasets from the local data directory.

    The loader checks canonical file names and known fallback names, reads any
    available CSV into a DataFrame, and returns empty DataFrames for missing
    or unreadable sources so callers can handle partial availability cleanly.
    """
    data = {}
    for key, dataset in datasets.items():
        candidates = [dataset.get('file')] + LOCAL_FILE_FALLBACKS.get(key, [])
        existing_path = None
        for candidate in candidates:
            if not candidate:
                continue
            candidate_path = os.path.join(DATA_DIR, candidate)
            if os.path.exists(candidate_path):
                existing_path = candidate_path
                break

        if existing_path:
            try:
                data[key] = pd.read_csv(existing_path)
                print(f"Loaded {key} dataset from {existing_path}")
            except Exception as e:
                print(f"Error loading {key}: {e}")
                data[key] = pd.DataFrame()  # empty df
        else:
            print(f"File not found for {key}. Tried: {candidates}")
            data[key] = pd.DataFrame()
    
    return data
