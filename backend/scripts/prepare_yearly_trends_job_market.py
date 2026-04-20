"""Prepare the cached yearly trends dataset for the Hire Sight backend.

This helper is only for manual refreshes. The backend runtime loads the
already-downloaded CSV from backend/data and does not fetch it on startup.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

import requests


DATASET_REPO = "yiqing111/Engineering_Jobs_Insight_Dataset"
DATASET_FILE = "Engineering_Jobs_Insight_Dataset.csv"
BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
CANONICAL_OUTPUT = DATA_DIR / "yearly_trends_job_market.csv"


def _copy_csv(input_path: Path) -> None:
    """Copy the chosen CSV into the backend data directory."""
    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {input_path}")
    if input_path.suffix.lower() != ".csv":
        raise ValueError(f"Expected a CSV file, got: {input_path.name}")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(input_path, CANONICAL_OUTPUT)
    print(f"Prepared yearly trends dataset at {CANONICAL_OUTPUT}")


def _download_from_huggingface() -> Path:
    """Download the public Hugging Face CSV and refresh the local cache."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    download_url = f"https://huggingface.co/datasets/{DATASET_REPO}/resolve/main/{DATASET_FILE}"
    response = requests.get(download_url, timeout=60)
    response.raise_for_status()
    CANONICAL_OUTPUT.write_bytes(response.content)
    print(f"Downloaded yearly trends dataset from {download_url}")
    return CANONICAL_OUTPUT


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        help="Path to a manually downloaded Engineering Jobs Insight CSV",
    )
    args = parser.parse_args()

    try:
        if args.input:
            _copy_csv(args.input)
        else:
            _download_from_huggingface()
    except Exception as exc:
        print(f"Error preparing yearly_trends_job_market dataset: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
