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
from payment_routes import payment_router

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
        query = "SELECT id, email, name, avatar, coins, created_at FROM users WHERE id = %s"
        user_data = execute_query(query, (user.id,), fetch_one=True)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return {
            "id": str(user_data['id']),
            "email": user_data['email'],
            "name": user_data['name'],
            "avatar": user_data['avatar'],
            "coins": user_data['coins']
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
        query = supabase.table('shows').select('*')
        
        if category:
            query = query.eq('category', category)
        if featured is not None:
            query = query.eq('is_featured', featured)
        if search:
            query = query.ilike('title', f'%{search}%')
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/shows/{show_id}")
async def get_show(show_id: str):
    try:
        response = supabase.table('shows').select('*').eq('id', show_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Show not found")

@api_router.get("/shows/{show_id}/episodes")
async def get_episodes(show_id: str):
    try:
        response = supabase.table('episodes').select('*').eq('show_id', show_id).order('episode_number').execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Watchlist Routes
@api_router.get("/watchlist")
async def get_watchlist(user = Depends(get_current_user)):
    try:
        response = supabase.table('watchlist').select('*, shows(*)').eq('user_id', user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/watchlist/{show_id}")
async def add_to_watchlist(show_id: str, user = Depends(get_current_user)):
    try:
        response = supabase.table('watchlist').insert({
            "user_id": user.id,
            "show_id": show_id
        }).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/watchlist/{show_id}")
async def remove_from_watchlist(show_id: str, user = Depends(get_current_user)):
    try:
        response = supabase.table('watchlist').delete().eq('user_id', user.id).eq('show_id', show_id).execute()
        return {"message": "Removed from watchlist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Watch History Routes
@api_router.get("/history")
async def get_watch_history(user = Depends(get_current_user)):
    try:
        response = supabase.table('watch_history').select('*, shows(*)').eq('user_id', user.id).order('watched_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/history")
async def add_watch_history(history: AddWatchHistory, user = Depends(get_current_user)):
    try:
        response = supabase.table('watch_history').insert({
            "user_id": user.id,
            "show_id": history.show_id,
            "episode_number": history.episode_number
        }).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/history")
async def clear_watch_history(user = Depends(get_current_user)):
    try:
        response = supabase.table('watch_history').delete().eq('user_id', user.id).execute()
        return {"message": "Watch history cleared"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# User Profile Routes
@api_router.get("/profile")
async def get_profile(user = Depends(get_current_user)):
    try:
        response = supabase.table('users').select('*').eq('id', user.id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Profile not found")

@api_router.put("/profile")
async def update_profile(name: str, user = Depends(get_current_user)):
    try:
        response = supabase.table('users').update({"name": name}).eq('id', user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/profile/coins")
async def purchase_coins(amount: int, user = Depends(get_current_user)):
    try:
        # Get current coins
        profile = supabase.table('users').select('coins').eq('id', user.id).single().execute()
        current_coins = profile.data['coins']
        
        # Update coins
        response = supabase.table('users').update({"coins": current_coins + amount}).eq('id', user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Include the routers in the main app
app.include_router(api_router)
api_router.include_router(admin_router)
api_router.include_router(payment_router)

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