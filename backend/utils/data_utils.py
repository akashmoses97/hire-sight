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

def download_datasets():
    """Download all datasets from Google Drive"""
    for key, dataset in datasets.items():
        url = f"https://drive.google.com/uc?export=download&id={dataset['gdrive_id']}"
        file_path = os.path.join(DATA_DIR, dataset['file'])
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {key} dataset to {file_path}")
        except Exception as e:
            print(f"Error downloading {key}: {e}")
        
def load_datasets():
    """
    Load datasets from downloaded CSV files into pandas DataFrames
    """
    data = {}
    for key, dataset in datasets.items():
        file_path = os.path.join(DATA_DIR, dataset['file'])
        if os.path.exists(file_path):
            try:
                data[key] = pd.read_csv(file_path)
                print(f"Loaded {key} dataset from {file_path}")
            except Exception as e:
                print(f"Error loading {key}: {e}")
                data[key] = pd.DataFrame()  # empty df
        else:
            print(f"File not found for {key}: {file_path}")
            data[key] = pd.DataFrame()
    
    return data