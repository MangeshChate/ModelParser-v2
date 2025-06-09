from flask import Blueprint,request ,jsonify
from app import db,bcrypt
from app.models import User
from app.utils.token_utils import generate_token

auth_bp = Blueprint('auth' , __name__ ,url_prefix='/auth')

@auth_bp.route('/register' ,methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message':'username and password required'}),400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409

    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'] , password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message' : 'User registerd successfully'}),201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password required'}), 400

    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = generate_token(user.id)
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'created_at': user.created_at.isoformat()
            }
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401