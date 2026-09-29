#!/usr/bin/env python
"""
UL STUDY FLOW LEARNING - Django Management Entrypoint (Root)
Allows running `python manage.py <command>` directly from the workspace root.
"""
import os
import sys
from pathlib import Path

def main():
    BASE_DIR = Path(__file__).resolve().parent
    BACKEND_DIR = BASE_DIR / 'backend'
    sys.path.insert(0, str(BACKEND_DIR))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studyflow.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
