# app/__init__.py

from flask import Flask
from flask_cors import CORS           # ← ajoute cet import
from app.extensions import db
from app.routes import api_bp
from dotenv import load_dotenv
import os

def create_app():
    """
    Create and configure the Flask application.
    """
    load_dotenv()  # Load environment variables from .env

    app = Flask(__name__)

    # Enable CORS for all /api/* routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Build the SQLALCHEMY_DATABASE_URI from individual RDS env variables
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    # Initialize SQLAlchemy
    db.init_app(app)
    
    app.config.update(
        MAIL_SENDER_EMAIL=os.getenv("MAIL_SENDER_EMAIL", "no-reply@votre-app.local"),
        MAIL_SENDER_NAME=os.getenv("MAIL_SENDER_NAME", "Ma Plateforme"),
        SMTP_HOST=os.getenv("SMTP_HOST", "smtp.gmail.com"),
        SMTP_PORT=int(os.getenv("SMTP_PORT", "587")),
        SMTP_USE_TLS=os.getenv("SMTP_USE_TLS", "true").lower() in ("1","true","yes","on"),
        SMTP_USERNAME=os.getenv("SMTP_USERNAME"),
        SMTP_PASSWORD=os.getenv("SMTP_PASSWORD"),
        FRONTEND_BASE_URL=os.getenv("FRONTEND_BASE_URL", "https://app.example.com"),
        SMTP_TIMEOUT=float(os.getenv("SMTP_TIMEOUT", "20")),
    )
    # Enregistre tes routes sur /api
    app.register_blueprint(api_bp, url_prefix="/api")

    # Crée les tables si besoin
    with app.app_context():
        db.create_all()

    return app
