from fastapi import HTTPException, Depends
from supabase_client import supabase
from auth import get_current_user

async def get_admin_user(user = Depends(get_current_user)):
    """Verify that the current user is an admin"""
    try:
        # Check if user is admin
        response = supabase.table('users').select('is_admin').eq('id', user.id).single().execute()
        
        if not response.data or not response.data.get('is_admin'):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Admin verification failed: {str(e)}")

async def log_admin_action(admin_id: str, action: str, resource_type: str, resource_id: str = None, details: dict = None):
    """Log admin actions for audit trail"""
    try:
        log_data = {
            "admin_id": admin_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details
        }
        supabase.table('admin_logs').insert(log_data).execute()
    except Exception as e:
        print(f"Error logging admin action: {str(e)}")
