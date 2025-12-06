from fastapi import HTTPException, Depends
from db import execute_query
from auth import get_current_user

async def get_admin_user(user = Depends(get_current_user)):
    """Verify that the current user is an admin"""
    try:
        # Check if user is admin
        query = "SELECT is_admin FROM users WHERE id = %s"
        result = execute_query(query, (user.id,), fetch_one=True)
        
        if not result or not result.get('is_admin'):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Admin verification failed: {str(e)}")

async def log_admin_action(admin_id: str, action: str, resource_type: str, resource_id: str = None, details: dict = None):
    """Log admin actions for audit trail"""
    try:
        # For now, just print the action (could extend to insert into admin_logs table if needed)
        print(f"Admin Action: {action} by {admin_id} on {resource_type} {resource_id}")
    except Exception as e:
        print(f"Error logging admin action: {str(e)}")
