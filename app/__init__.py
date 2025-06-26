"""
Application factory module for initializing the Flask app and registering components.
"""

from flask import Flask
from .extensions import db
from .routes import api_bp
from dotenv import load_dotenv
import os

def create_app():
    """
    Create and configure the Flask application.
    
    Returns:
        Flask: The configured Flask app instance.
    """
    load_dotenv()  # Load environment variables from .env file

    app = Flask(__name__)

    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"]=os.getenv('SECRET_KEY')
    app.config.from_prefixed_env()  # Load other environment variables with prefix

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    # Create all tables
    with app.app_context():
        db.create_all()

    return app
