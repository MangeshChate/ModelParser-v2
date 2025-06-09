from flask import request, jsonify
from functools import wraps
from app.utils.token_utils import verify_token
from app.models import User

def token_required(f):
    @wraps(f)
    def decorated(*args , **kwargs):
        token = None
        
        # jwt is passed in the request header
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
            
        if not token:
            return jsonify({'message' : 'Token is missing'}),401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'message':'token is invalid or expired'}),400
        
        return f(user_id ,*args ,**kwargs)
    
    return decorated