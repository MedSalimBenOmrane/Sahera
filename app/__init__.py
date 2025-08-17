# app/__init__.py

from flask import Flask
from flask_cors import CORS           # ← ajoute cet import
from .extensions import db
from .routes import api_bp
from dotenv import load_dotenv
import os

def create_app():
    """
    Create and configure the Flask application.
    """
    load_dotenv()  # Charge les variables d'env

    app = Flask(__name__)

    # ← active CORS pour tous les /api/*
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Configuration de la BDD et du secret
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config.from_prefixed_env()

    # Initialise SQLAlchemy
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
