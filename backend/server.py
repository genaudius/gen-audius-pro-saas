"""Alias: supervisord.conf expects `server:app`. Real app lives in main.py."""
from main import app  # noqa: F401
