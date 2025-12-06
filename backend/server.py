from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from db import execute_query
from auth import get_current_user, hash_password, verify_password, create_access_token
from admin_routes import admin_router
# from payment_routes import payment_router  # Temporarily disabled - needs PostgreSQL migration

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    coins: int

class Show(BaseModel):
    id: str
    title: str
    thumbnail: str
    category: str
    rating: float
    views: str
    total_episodes: int
    is_exclusive: bool
    description: str
    duration: str
    is_featured: bool

class Episode(BaseModel):
    id: str
    show_id: str
    episode_number: int
    title: str
    duration: int
    is_locked: bool
    thumbnail: str
    coins_required: int

class WatchlistItem(BaseModel):
    id: str
    show_id: str
    created_at: str

class WatchHistoryItem(BaseModel):
    id: str
    show_id: str
    episode_number: int
    watched_at: str

class AddWatchHistory(BaseModel):
    show_id: str
    episode_number: int

# Authentication Routes
@api_router.post("/auth/signup")
async def signup(request: SignupRequest):
    try:
        # Check if user already exists
        check_query = "SELECT id FROM users WHERE email = %s"
        existing_user = execute_query(check_query, (request.email,), fetch_one=True)
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create user
        hashed_pw = hash_password(request.password)
        insert_query = """
            INSERT INTO users (email, password_hash, name, coins)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, name, avatar, coins, created_at
        """
        user_data = execute_query(
            insert_query, 
            (request.email, hashed_pw, request.name, 150),
            fetch_one=True
        )
        
        # Create JWT token
        access_token = create_access_token(str(user_data['id']), user_data['email'])
        
        return {
            "user": {
                "id": str(user_data['id']),
                "email": user_data['email'],
                "name": user_data['name'],
                "avatar": user_data['avatar'],
                "coins": user_data['coins'],
                "is_admin": user_data.get('is_admin', False)
            },
            "session": {
                "access_token": access_token,
                "token_type": "bearer"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    try:
        # Get user from database
        query = "SELECT * FROM users WHERE email = %s"
        user_data = execute_query(query, (request.email,), fetch_one=True)
        
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user_data['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create JWT token
        access_token = create_access_token(str(user_data['id']), user_data['email'])
        
        return {
            "user": {
                "id": str(user_data['id']),
                "email": user_data['email'],
                "name": user_data['name'],
                "avatar": user_data['avatar'],
                "coins": user_data['coins']
            },
            "session": {
                "access_token": access_token,
                "token_type": "bearer"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@api_router.post("/auth/logout")
async def logout(user = Depends(get_current_user)):
    # With JWT, logout is handled client-side by removing the token
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    try:
        query = "SELECT id, email, name, avatar, coins, is_admin, created_at FROM users WHERE id = %s"
        user_data = execute_query(query, (user.id,), fetch_one=True)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return {
            "id": str(user_data['id']),
            "email": user_data['email'],
            "name": user_data['name'],
            "avatar": user_data['avatar'],
            "coins": user_data['coins'],
            "is_admin": user_data.get('is_admin', False)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"User profile not found: {str(e)}")

# Shows Routes
@api_router.get("/shows")
async def get_shows(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None
):
    try:
        query = "SELECT * FROM shows WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = %s"
            params.append(category)
        if featured is not None:
            query += " AND is_featured = %s"
            params.append(featured)
        if search:
            query += " AND title ILIKE %s"
            params.append(f'%{search}%')
        
        query += " ORDER BY created_at DESC"
        
        shows = execute_query(query, tuple(params) if params else None, fetch_all=True)
        
        # Convert UUID to string for JSON serialization
        result = []
        for show in shows:
            result.append({
                "id": str(show['id']),
                "title": show['title'],
                "thumbnail": show['thumbnail'],
                "category": show['category'],
                "rating": float(show['rating']) if show['rating'] else 0.0,
                "views": show['views'],
                "total_episodes": show['total_episodes'],
                "is_exclusive": show['is_exclusive'],
                "description": show['description'],
                "duration": show['duration'],
                "is_featured": show['is_featured']
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/shows/{show_id}")
async def get_show(show_id: str):
    try:
        query = "SELECT * FROM shows WHERE id = %s"
        show = execute_query(query, (show_id,), fetch_one=True)
        
        if not show:
            raise HTTPException(status_code=404, detail="Show not found")
        
        return {
            "id": str(show['id']),
            "title": show['title'],
            "thumbnail": show['thumbnail'],
            "category": show['category'],
            "rating": float(show['rating']) if show['rating'] else 0.0,
            "views": show['views'],
            "total_episodes": show['total_episodes'],
            "is_exclusive": show['is_exclusive'],
            "description": show['description'],
            "duration": show['duration'],
            "is_featured": show['is_featured']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Show not found")

@api_router.get("/shows/{show_id}/episodes")
async def get_episodes(show_id: str):
    try:
        query = "SELECT * FROM episodes WHERE show_id = %s ORDER BY episode_number"
        episodes = execute_query(query, (show_id,), fetch_all=True)
        
        result = []
        for ep in episodes:
            result.append({
                "id": str(ep['id']),
                "show_id": str(ep['show_id']),
                "episode_number": ep['episode_number'],
                "title": ep['title'],
                "duration": ep['duration'],
                "is_locked": ep['is_locked'],
                "thumbnail": ep['thumbnail'],
                "coins_required": ep['coins_required']
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Watchlist Routes
@api_router.get("/watchlist")
async def get_watchlist(user = Depends(get_current_user)):
    try:
        query = """
            SELECT w.id, w.show_id, w.created_at,
                   s.id as show_id, s.title, s.thumbnail, s.category, 
                   s.rating, s.views, s.total_episodes, s.is_exclusive,
                   s.description, s.duration, s.is_featured
            FROM watchlist w
            JOIN shows s ON w.show_id = s.id
            WHERE w.user_id = %s
            ORDER BY w.created_at DESC
        """
        watchlist = execute_query(query, (user.id,), fetch_all=True)
        
        result = []
        for item in watchlist:
            result.append({
                "id": str(item['id']),
                "show_id": str(item['show_id']),
                "created_at": str(item['created_at']),
                "shows": {
                    "id": str(item['show_id']),
                    "title": item['title'],
                    "thumbnail": item['thumbnail'],
                    "category": item['category'],
                    "rating": float(item['rating']) if item['rating'] else 0.0,
                    "views": item['views'],
                    "total_episodes": item['total_episodes'],
                    "is_exclusive": item['is_exclusive'],
                    "description": item['description'],
                    "duration": item['duration'],
                    "is_featured": item['is_featured']
                }
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/watchlist/{show_id}")
async def add_to_watchlist(show_id: str, user = Depends(get_current_user)):
    try:
        query = """
            INSERT INTO watchlist (user_id, show_id)
            VALUES (%s, %s)
            ON CONFLICT (user_id, show_id) DO NOTHING
            RETURNING id, user_id, show_id, created_at
        """
        result = execute_query(query, (user.id, show_id), fetch_one=True)
        
        if result:
            return {
                "id": str(result['id']),
                "user_id": str(result['user_id']),
                "show_id": str(result['show_id']),
                "created_at": str(result['created_at'])
            }
        return {"message": "Already in watchlist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/watchlist/{show_id}")
async def remove_from_watchlist(show_id: str, user = Depends(get_current_user)):
    try:
        query = "DELETE FROM watchlist WHERE user_id = %s AND show_id = %s"
        execute_query(query, (user.id, show_id), fetch_all=False)
        return {"message": "Removed from watchlist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Watch History Routes
@api_router.get("/history")
async def get_watch_history(user = Depends(get_current_user)):
    try:
        query = """
            SELECT h.id, h.show_id, h.episode_number, h.watched_at,
                   s.id as show_id, s.title, s.thumbnail, s.category, 
                   s.rating, s.views, s.total_episodes, s.is_exclusive,
                   s.description, s.duration, s.is_featured
            FROM watch_history h
            JOIN shows s ON h.show_id = s.id
            WHERE h.user_id = %s
            ORDER BY h.watched_at DESC
        """
        history = execute_query(query, (user.id,), fetch_all=True)
        
        result = []
        for item in history:
            result.append({
                "id": str(item['id']),
                "show_id": str(item['show_id']),
                "episode_number": item['episode_number'],
                "watched_at": str(item['watched_at']),
                "shows": {
                    "id": str(item['show_id']),
                    "title": item['title'],
                    "thumbnail": item['thumbnail'],
                    "category": item['category'],
                    "rating": float(item['rating']) if item['rating'] else 0.0,
                    "views": item['views'],
                    "total_episodes": item['total_episodes'],
                    "is_exclusive": item['is_exclusive'],
                    "description": item['description'],
                    "duration": item['duration'],
                    "is_featured": item['is_featured']
                }
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/history")
async def add_watch_history(history: AddWatchHistory, user = Depends(get_current_user)):
    try:
        query = """
            INSERT INTO watch_history (user_id, show_id, episode_number)
            VALUES (%s, %s, %s)
            RETURNING id, user_id, show_id, episode_number, watched_at
        """
        result = execute_query(
            query, 
            (user.id, history.show_id, history.episode_number),
            fetch_one=True
        )
        
        return {
            "id": str(result['id']),
            "user_id": str(result['user_id']),
            "show_id": str(result['show_id']),
            "episode_number": result['episode_number'],
            "watched_at": str(result['watched_at'])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/history")
async def clear_watch_history(user = Depends(get_current_user)):
    try:
        query = "DELETE FROM watch_history WHERE user_id = %s"
        execute_query(query, (user.id,), fetch_all=False)
        return {"message": "Watch history cleared"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# User Profile Routes
@api_router.get("/profile")
async def get_profile(user = Depends(get_current_user)):
    try:
        query = "SELECT id, email, name, avatar, coins, created_at FROM users WHERE id = %s"
        profile = execute_query(query, (user.id,), fetch_one=True)
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {
            "id": str(profile['id']),
            "email": profile['email'],
            "name": profile['name'],
            "avatar": profile['avatar'],
            "coins": profile['coins']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Profile not found")

@api_router.put("/profile")
async def update_profile(name: str, user = Depends(get_current_user)):
    try:
        query = """
            UPDATE users 
            SET name = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s
            RETURNING id, email, name, avatar, coins
        """
        result = execute_query(query, (name, user.id), fetch_one=True)
        
        return {
            "id": str(result['id']),
            "email": result['email'],
            "name": result['name'],
            "avatar": result['avatar'],
            "coins": result['coins']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/profile/coins")
async def purchase_coins(amount: int, user = Depends(get_current_user)):
    try:
        # Get current coins
        query = "SELECT coins FROM users WHERE id = %s"
        profile = execute_query(query, (user.id,), fetch_one=True)
        current_coins = profile['coins']
        
        # Update coins
        update_query = """
            UPDATE users 
            SET coins = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s
            RETURNING id, email, name, avatar, coins
        """
        result = execute_query(update_query, (current_coins + amount, user.id), fetch_one=True)
        
        return {
            "id": str(result['id']),
            "email": result['email'],
            "name": result['name'],
            "avatar": result['avatar'],
            "coins": result['coins']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Include the routers in the main app
app.include_router(api_router)
api_router.include_router(admin_router)
# api_router.include_router(payment_router)  # Temporarily disabled - needs PostgreSQL migration

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)