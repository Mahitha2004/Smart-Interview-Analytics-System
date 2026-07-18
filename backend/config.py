import os
from pathlib import Path
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', False)
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024         
    UPLOAD_FOLDER = 'uploads'
    REPORTS_FOLDER = 'reports'
    Path(UPLOAD_FOLDER).mkdir(exist_ok=True)
    Path(REPORTS_FOLDER).mkdir(exist_ok=True)
