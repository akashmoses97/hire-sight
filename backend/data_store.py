"""Shared in-memory data store for loaded datasets.

This module exposes the global cache used by routers and services after the
application loads and cleans source datasets during backend startup.
"""

# Global data storage
all_data = {}
