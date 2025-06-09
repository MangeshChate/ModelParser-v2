import jwt
import os
from datetime import datetime ,timedelta

def generate_token(user_id):
    payload = {
        'user_id':user_id,
        'exp':datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload ,os.getenv('SECRET_KEY'),algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token ,os.getenv('SECRET_KEY') , algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidSignatureError:
        return None