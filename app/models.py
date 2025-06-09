from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    models = db.relationship('ModelMetadata', backref='user', lazy=True)

    def __init__(self, username, password):
        self.username = username
        self.password = password


class ModelMetadata(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False)
    metadata_json = db.Column(db.JSON, nullable=False)  
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__(self, file_name, metadata_json, user_id):
        self.file_name = file_name
        self.metadata_json = metadata_json
        self.user_id = user_id
