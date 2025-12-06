from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from db import execute_query
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
        # Calculate stats from tables
        users_count = execute_query("SELECT COUNT(*) as count FROM users", fetch_one=True)
        shows_count = execute_query("SELECT COUNT(*) as count FROM shows", fetch_one=True)
        episodes_count = execute_query("SELECT COUNT(*) as count FROM episodes", fetch_one=True)
        watchlist_count = execute_query("SELECT COUNT(*) as count FROM watchlist", fetch_one=True)
        history_count = execute_query("SELECT COUNT(*) as count FROM watch_history", fetch_one=True)
        
        new_users_30d = execute_query(
            "SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'",
            fetch_one=True
        )
        views_30d = execute_query(
            "SELECT COUNT(*) as count FROM watch_history WHERE watched_at >= NOW() - INTERVAL '30 days'",
            fetch_one=True
        )
        
        return {
            "total_users": users_count['count'],
            "total_shows": shows_count['count'],
            "total_episodes": episodes_count['count'],
            "total_watchlist_items": watchlist_count['count'],
            "total_views": history_count['count'],
            "new_users_30d": new_users_30d['count'],
            "views_30d": views_30d['count']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Recent Activity
@admin_router.get("/activity")
async def get_recent_activity(limit: int = 20, admin = Depends(get_admin_user)):
    try:
        # Return empty list for now (could implement admin_logs table if needed)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Shows Management
@admin_router.post("/shows")
async def create_show(show: ShowCreate, admin = Depends(get_admin_user)):
    try:
        query = """
            INSERT INTO shows (title, thumbnail, category, rating, views, total_episodes, 
                             is_exclusive, description, duration, is_featured)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """
        show_data = show.dict()
        result = execute_query(
            query,
            (show_data['title'], show_data['thumbnail'], show_data['category'], 
             show_data['rating'], show_data['views'], show_data['total_episodes'],
             show_data['is_exclusive'], show_data['description'], 
             show_data['duration'], show_data['is_featured']),
            fetch_one=True
        )
        await log_admin_action(admin.id, "CREATE", "show", str(result['id']), show_data)
        
        return {
            "id": str(result['id']),
            "title": result['title'],
            "thumbnail": result['thumbnail'],
            "category": result['category'],
            "rating": float(result['rating']),
            "views": result['views'],
            "total_episodes": result['total_episodes'],
            "is_exclusive": result['is_exclusive'],
            "description": result['description'],
            "duration": result['duration'],
            "is_featured": result['is_featured']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.put("/shows/{show_id}")
async def update_show(show_id: str, show: ShowUpdate, admin = Depends(get_admin_user)):
    try:
        update_data = {k: v for k, v in show.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        set_clause = ", ".join([f"{k} = %s" for k in update_data.keys()])
        query = f"UPDATE shows SET {set_clause} WHERE id = %s RETURNING *"
        
        result = execute_query(
            query,
            tuple(list(update_data.values()) + [show_id]),
            fetch_one=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Show not found")
        
        await log_admin_action(admin.id, "UPDATE", "show", show_id, update_data)
        
        return {
            "id": str(result['id']),
            "title": result['title'],
            "thumbnail": result['thumbnail'],
            "category": result['category'],
            "rating": float(result['rating']),
            "views": result['views'],
            "total_episodes": result['total_episodes'],
            "is_exclusive": result['is_exclusive'],
            "description": result['description'],
            "duration": result['duration'],
            "is_featured": result['is_featured']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.delete("/shows/{show_id}")
async def delete_show(show_id: str, admin = Depends(get_admin_user)):
    try:
        query = "DELETE FROM shows WHERE id = %s"
        execute_query(query, (show_id,), fetch_all=False)
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
