from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from supabase_client import supabase
from auth import get_current_user

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
        # Sign up user
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "name": request.name
                }
            }
        })
        
        if response.user:
            return {
                "user": response.user,
                "session": response.session
            }
        else:
            raise HTTPException(status_code=400, detail="Signup failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if response.user and response.session:
            return {
                "user": response.user,
                "session": response.session
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@api_router.post("/auth/logout")
async def logout(user = Depends(get_current_user)):
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    try:
        # Get user profile from users table
        response = supabase.table('users').select('*').eq('id', user.id).single().execute()
        return response.data
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

# Include the router in the main app
app.include_router(api_router)

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