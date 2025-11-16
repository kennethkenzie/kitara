from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from supabase_client import supabase
from auth import get_current_user
from mobile_money import mobile_money_service
import logging

logger = logging.getLogger(__name__)

payment_router = APIRouter(prefix="/payments", tags=["payments"])

# Models
class InitiatePaymentRequest(BaseModel):
    episode_id: str
    phone_number: str
    payment_method: str  # 'mtn' or 'airtel'

class VerifyPaymentRequest(BaseModel):
    transaction_id: str
    provider: str

class SubscriptionRequest(BaseModel):
    plan: str  # 'monthly' or 'annual'
    phone_number: str
    payment_method: str

# Check if user has access to episode
@payment_router.get("/episode/{episode_id}/access")
async def check_episode_access(episode_id: str, user = Depends(get_current_user)):
    try:
        # Check using the database function
        result = supabase.rpc('user_has_episode_access', {
            'p_user_id': user.id,
            'p_episode_id': episode_id
        }).execute()
        
        has_access = result.data if result.data is not None else False
        
        return {
            "has_access": has_access,
            "episode_id": episode_id
        }
    except Exception as e:
        logger.error(f"Error checking episode access: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Initiate episode payment
@payment_router.post("/episode/initiate")
async def initiate_episode_payment(request: InitiatePaymentRequest, user = Depends(get_current_user)):
    try:
        # Get episode details
        episode = supabase.table('episodes').select('*').eq('id', request.episode_id).single().execute()
        if not episode.data:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        episode_data = episode.data
        amount = episode_data.get('price_ugx', 200)
        
        # Check if already purchased
        existing_purchase = supabase.table('user_episode_purchases').select('id').eq('user_id', user.id).eq('episode_id', request.episode_id).execute()
        if existing_purchase.data:
            return {
                "success": False,
                "message": "Episode already purchased"
            }
        
        # Initiate payment
        if request.payment_method == 'mtn':
            payment_result = mobile_money_service.initiate_mtn_payment(
                phone_number=request.phone_number,
                amount=amount,
                reference=request.episode_id
            )
        elif request.payment_method == 'airtel':
            payment_result = mobile_money_service.initiate_airtel_payment(
                phone_number=request.phone_number,
                amount=amount,
                reference=request.episode_id
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid payment method")
        
        if not payment_result.get('success'):
            return payment_result
        
        # Save payment record
        payment_record = {
            'user_id': user.id,
            'payment_type': 'episode',
            'payment_method': request.payment_method,
            'amount_ugx': amount,
            'phone_number': request.phone_number,
            'transaction_id': payment_result['transaction_id'],
            'status': payment_result['status'],
            'reference': request.episode_id,
            'provider_response': payment_result
        }
        
        payment_response = supabase.table('payments').insert(payment_record).execute()
        
        # If mock/sandbox mode and status is completed, immediately grant access
        if payment_result.get('mock') and payment_result['status'] == 'completed':
            supabase.table('user_episode_purchases').insert({
                'user_id': user.id,
                'episode_id': request.episode_id,
                'payment_id': payment_response.data[0]['id']
            }).execute()
            
            return {
                "success": True,
                "transaction_id": payment_result['transaction_id'],
                "status": "completed",
                "message": payment_result['message'],
                "access_granted": True
            }
        
        return {
            "success": True,
            "transaction_id": payment_result['transaction_id'],
            "status": payment_result['status'],
            "message": payment_result['message'],
            "payment_id": payment_response.data[0]['id']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Verify payment and grant access
@payment_router.post("/verify")
async def verify_payment(request: VerifyPaymentRequest, user = Depends(get_current_user)):
    try:
        # Get payment record
        payment = supabase.table('payments').select('*').eq('transaction_id', request.transaction_id).eq('user_id', user.id).single().execute()
        
        if not payment.data:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        payment_data = payment.data
        
        # If already completed, return success
        if payment_data['status'] == 'completed':
            return {
                "success": True,
                "status": "completed",
                "message": "Payment already verified"
            }
        
        # Verify with provider
        verification = mobile_money_service.verify_payment(request.transaction_id, request.provider)
        
        if verification.get('status') == 'completed':
            # Update payment status
            supabase.table('payments').update({
                'status': 'completed',
                'updated_at': 'now()'
            }).eq('id', payment_data['id']).execute()
            
            # Grant access to episode
            if payment_data['payment_type'] == 'episode':
                supabase.table('user_episode_purchases').insert({
                    'user_id': user.id,
                    'episode_id': payment_data['reference'],
                    'payment_id': payment_data['id']
                }).execute()
            
            return {
                "success": True,
                "status": "completed",
                "message": "Payment verified and access granted"
            }
        
        return {
            "success": False,
            "status": verification.get('status', 'pending'),
            "message": "Payment not yet completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user's payment history
@payment_router.get("/history")
async def get_payment_history(user = Depends(get_current_user)):
    try:
        payments = supabase.table('payments').select('*').eq('user_id', user.id).order('created_at', desc=True).execute()
        return payments.data
    except Exception as e:
        logger.error(f"Error fetching payment history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user's purchased episodes
@payment_router.get("/purchased-episodes")
async def get_purchased_episodes(user = Depends(get_current_user)):
    try:
        purchases = supabase.table('user_episode_purchases').select('*, episodes(*)').eq('user_id', user.id).execute()
        return purchases.data
    except Exception as e:
        logger.error(f"Error fetching purchased episodes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Subscription endpoints
@payment_router.post("/subscription/initiate")
async def initiate_subscription(request: SubscriptionRequest, user = Depends(get_current_user)):
    try:
        # Calculate amount based on plan
        amount = 10000 if request.plan == 'monthly' else 100000  # 10,000 UGX monthly, 100,000 UGX annual
        
        # Initiate payment
        if request.payment_method == 'mtn':
            payment_result = mobile_money_service.initiate_mtn_payment(
                phone_number=request.phone_number,
                amount=amount,
                reference=f"subscription_{request.plan}"
            )
        elif request.payment_method == 'airtel':
            payment_result = mobile_money_service.initiate_airtel_payment(
                phone_number=request.phone_number,
                amount=amount,
                reference=f"subscription_{request.plan}"
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid payment method")
        
        if not payment_result.get('success'):
            return payment_result
        
        # Save payment record
        payment_record = {
            'user_id': user.id,
            'payment_type': 'subscription',
            'payment_method': request.payment_method,
            'amount_ugx': amount,
            'phone_number': request.phone_number,
            'transaction_id': payment_result['transaction_id'],
            'status': payment_result['status'],
            'reference': request.plan,
            'provider_response': payment_result
        }
        
        payment_response = supabase.table('payments').insert(payment_record).execute()
        
        # If mock/sandbox and completed, grant subscription immediately
        if payment_result.get('mock') and payment_result['status'] == 'completed':
            from datetime import datetime, timedelta
            expires_at = datetime.now() + (timedelta(days=30) if request.plan == 'monthly' else timedelta(days=365))
            
            supabase.table('users').update({
                'subscription_type': request.plan,
                'subscription_expires_at': expires_at.isoformat()
            }).eq('id', user.id).execute()
            
            return {
                "success": True,
                "transaction_id": payment_result['transaction_id'],
                "status": "completed",
                "message": f"Subscription activated! Valid until {expires_at.strftime('%Y-%m-%d')}",
                "subscription_granted": True
            }
        
        return {
            "success": True,
            "transaction_id": payment_result['transaction_id'],
            "status": payment_result['status'],
            "message": payment_result['message'],
            "payment_id": payment_response.data[0]['id']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
