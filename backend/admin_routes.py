from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from supabase_client import supabase
from admin_auth import get_admin_user, log_admin_action

admin_router = APIRouter(prefix="/admin", tags=["admin"])

# Models
class ShowCreate(BaseModel):
    title: str
    thumbnail: str
    category: str
    rating: float
    views: str
    total_episodes: int
    is_exclusive: bool
    description: str
    duration: str
    is_featured: bool = False

class ShowUpdate(BaseModel):
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    views: Optional[str] = None
    total_episodes: Optional[int] = None
    is_exclusive: Optional[bool] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    is_featured: Optional[bool] = None

class EpisodeCreate(BaseModel):
    show_id: str
    episode_number: int
    title: str
    duration: int
    is_locked: bool
    thumbnail: str
    coins_required: int

class EpisodeUpdate(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    is_locked: Optional[bool] = None
    thumbnail: Optional[str] = None
    coins_required: Optional[int] = None

class UserUpdate(BaseModel):
    subscription_type: Optional[str] = None
    is_admin: Optional[bool] = None

# Dashboard Stats
@admin_router.get("/stats")
async def get_admin_stats(admin = Depends(get_admin_user)):
    try:
        # Get stats from the view
        stats_response = supabase.rpc('get_admin_stats').execute()
        
        # If view doesn't work, calculate manually
        if not stats_response.data:
            users = supabase.table('users').select('id', count='exact').execute()
            shows = supabase.table('shows').select('id', count='exact').execute()
            episodes = supabase.table('episodes').select('id', count='exact').execute()
            watchlist = supabase.table('watchlist').select('id', count='exact').execute()
            history = supabase.table('watch_history').select('id', count='exact').execute()
            
            return {
                "total_users": users.count or 0,
                "total_shows": shows.count or 0,
                "total_episodes": episodes.count or 0,
                "total_watchlist_items": watchlist.count or 0,
                "total_views": history.count or 0,
                "new_users_30d": 0,
                "views_30d": 0
            }
        
        return stats_response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Recent Activity
@admin_router.get("/activity")
async def get_recent_activity(limit: int = 20, admin = Depends(get_admin_user)):
    try:
        logs = supabase.table('admin_logs').select('*').order('created_at', desc=True).limit(limit).execute()
        return logs.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Shows Management
@admin_router.post("/shows")
async def create_show(show: ShowCreate, admin = Depends(get_admin_user)):
    try:
        response = supabase.table('shows').insert(show.dict()).execute()
        await log_admin_action(admin.id, "CREATE", "show", response.data[0]['id'], show.dict())
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.put("/shows/{show_id}")
async def update_show(show_id: str, show: ShowUpdate, admin = Depends(get_admin_user)):
    try:
        update_data = {k: v for k, v in show.dict().items() if v is not None}
        response = supabase.table('shows').update(update_data).eq('id', show_id).execute()
        await log_admin_action(admin.id, "UPDATE", "show", show_id, update_data)
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.delete("/shows/{show_id}")
async def delete_show(show_id: str, admin = Depends(get_admin_user)):
    try:
        response = supabase.table('shows').delete().eq('id', show_id).execute()
        await log_admin_action(admin.id, "DELETE", "show", show_id)
        return {"message": "Show deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Episodes Management
@admin_router.post("/episodes")
async def create_episode(episode: EpisodeCreate, admin = Depends(get_admin_user)):
    try:
        response = supabase.table('episodes').insert(episode.dict()).execute()
        await log_admin_action(admin.id, "CREATE", "episode", response.data[0]['id'], episode.dict())
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.put("/episodes/{episode_id}")
async def update_episode(episode_id: str, episode: EpisodeUpdate, admin = Depends(get_admin_user)):
    try:
        update_data = {k: v for k, v in episode.dict().items() if v is not None}
        response = supabase.table('episodes').update(update_data).eq('id', episode_id).execute()
        await log_admin_action(admin.id, "UPDATE", "episode", episode_id, update_data)
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.delete("/episodes/{episode_id}")
async def delete_episode(episode_id: str, admin = Depends(get_admin_user)):
    try:
        response = supabase.table('episodes').delete().eq('id', episode_id).execute()
        await log_admin_action(admin.id, "DELETE", "episode", episode_id)
        return {"message": "Episode deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Users Management
@admin_router.get("/users")
async def get_all_users(admin = Depends(get_admin_user)):
    try:
        response = supabase.table('users').select('*').order('created_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.put("/users/{user_id}")
async def update_user(user_id: str, user_update: UserUpdate, admin = Depends(get_admin_user)):
    try:
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        response = supabase.table('users').update(update_data).eq('id', user_id).execute()
        await log_admin_action(admin.id, "UPDATE", "user", user_id, update_data)
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.get("/users/{user_id}/details")
async def get_user_details(user_id: str, admin = Depends(get_admin_user)):
    try:
        # Get user info
        user = supabase.table('users').select('*').eq('id', user_id).single().execute()
        
        # Get user watchlist
        watchlist = supabase.table('watchlist').select('*').eq('user_id', user_id).execute()
        
        # Get user watch history
        history = supabase.table('watch_history').select('*').eq('user_id', user_id).execute()
        
        return {
            "user": user.data,
            "watchlist_count": len(watchlist.data),
            "watch_history_count": len(history.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
