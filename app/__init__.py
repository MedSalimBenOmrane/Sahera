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

    # Enregistre tes routes sur /api
    app.register_blueprint(api_bp, url_prefix="/api")

    # Crée les tables si besoin
    with app.app_context():
        db.create_all()

    return app
