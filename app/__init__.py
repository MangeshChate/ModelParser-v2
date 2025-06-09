from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

    db.init_app(app)
    bcrypt.init_app(app)

    # Register Blueprints
    
    from app.routes.auth_routes import auth_bp
    from app.routes.protected_routes import protected_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(protected_bp)

    return app 
