import os

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///student_hub.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change-in-production'
    
    # Firebase configuration (if needed)
    FIREBASE_CONFIG = {
        'apiKey': os.environ.get('FIREBASE_API_KEY'),
        'authDomain': os.environ.get('FIREBASE_AUTH_DOMAIN'),
        'projectId': os.environ.get('FIREBASE_PROJECT_ID'),
        'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET'),
        'messagingSenderId': os.environ.get('FIREBASE_MESSAGING_SENDER_ID'),
        'appId': os.environ.get('FIREBASE_APP_ID')
    } 