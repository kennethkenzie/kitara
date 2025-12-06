from fastapi import HTTPException, Header
from typing import Optional
import jwt
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from db import execute_query

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, email: str) -> str:
    """Create JWT access token"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class User:
    """User object to match expected structure"""
    def __init__(self, user_data):
        self.id = str(user_data['id'])
        self.email = user_data['email']
        self.name = user_data.get('name', '')
        self.avatar = user_data.get('avatar')
        self.coins = user_data.get('coins', 0)

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Extract and verify user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        
        # Decode token
        payload = decode_token(token)
        user_id = payload.get('user_id')
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Get user from database
        query = "SELECT * FROM users WHERE id = %s"
        user_data = execute_query(query, (user_id,), fetch_one=True)
        
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(user_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
