from flask import Blueprint, jsonify, request
from app.middleware.auth_middleware import token_required
from app.models import User, ModelMetadata
from app import db

protected_bp = Blueprint('protected', __name__, url_prefix='/api')

#  GET: Fetch all metadata for the authenticated user
@protected_bp.route('/metadata', methods=['GET'])
@token_required
def get_metadata(current_user_id):
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    metadata_list = ModelMetadata.query.filter_by(user_id=current_user_id).all()

    response = [{
        "id": meta.id,
        "file_name": meta.file_name,
        "metadata_json": meta.metadata_json,
        "uploaded_at": meta.uploaded_at.isoformat()
    } for meta in metadata_list]

    return jsonify(response), 200


#  POST: Upload filtered model metadata
@protected_bp.route('/metadata', methods=['POST'])
@token_required
def upload_metadata(current_user_id):
    data = request.get_json()

    metadata = data.get("metadata")
    file_name = data.get("file_name")

    if not metadata or not file_name:
        return jsonify({"error": "file_name and metadata are required"}), 400

    new_model = ModelMetadata(
        file_name=file_name,
        metadata_json=metadata,
        user_id=current_user_id
    )
    db.session.add(new_model)
    db.session.commit()

    return jsonify({"message": "Metadata uploaded successfully"}), 201

#Delete Route
@protected_bp.route('/metadata/<int:metadata_id>', methods=['DELETE'])
@token_required
def delete_metadata(current_user_id, metadata_id):
    metadata = ModelMetadata.query.filter_by(id=metadata_id, user_id=current_user_id).first()

    if not metadata:
        return jsonify({"error": "Metadata not found"}), 404

    db.session.delete(metadata)
    db.session.commit()

    return jsonify({"message": "Metadata deleted successfully"}), 200