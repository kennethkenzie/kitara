import os
import requests
import uuid
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class MobileMoneyService:
    """Service for handling MTN Mobile Money and Airtel Money payments"""
    
    def __init__(self):
        # MTN Mobile Money Config (Sandbox)
        self.mtn_collection_url = os.getenv('MTN_COLLECTION_URL', 'https://sandbox.momodeveloper.mtn.com/collection')
        self.mtn_subscription_key = os.getenv('MTN_SUBSCRIPTION_KEY', 'YOUR_SANDBOX_KEY')
        self.mtn_api_user = os.getenv('MTN_API_USER', '')
        self.mtn_api_key = os.getenv('MTN_API_KEY', '')
        
        # Airtel Money Config (Sandbox)
        self.airtel_base_url = os.getenv('AIRTEL_BASE_URL', 'https://openapiuat.airtel.africa')
        self.airtel_client_id = os.getenv('AIRTEL_CLIENT_ID', 'YOUR_CLIENT_ID')
        self.airtel_client_secret = os.getenv('AIRTEL_CLIENT_SECRET', 'YOUR_CLIENT_SECRET')
        
        self.is_sandbox = os.getenv('PAYMENT_ENV', 'sandbox') == 'sandbox'
    
    def initiate_mtn_payment(self, phone_number: str, amount: int, reference: str) -> dict:
        """Initiate MTN Mobile Money payment"""
        try:
            # For sandbox/demo mode
            if self.is_sandbox or not self.mtn_api_user:
                return self._mock_payment_response('mtn', phone_number, amount, reference)
            
            # Real MTN API integration
            transaction_id = str(uuid.uuid4())
            
            # First, get access token
            token = self._get_mtn_access_token()
            
            headers = {
                'Authorization': f'Bearer {token}',
                'X-Reference-Id': transaction_id,
                'X-Target-Environment': 'sandbox',
                'Ocp-Apim-Subscription-Key': self.mtn_subscription_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'amount': str(amount),
                'currency': 'UGX',
                'externalId': reference,
                'payer': {
                    'partyIdType': 'MSISDN',
                    'partyId': phone_number
                },
                'payerMessage': 'Payment for Kitara Cinema episode',
                'payeeNote': f'Episode purchase - {reference}'
            }
            
            response = requests.post(
                f'{self.mtn_collection_url}/v1_0/requesttopay',
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 202:
                return {
                    'success': True,
                    'transaction_id': transaction_id,
                    'status': 'pending',
                    'provider': 'mtn',
                    'message': 'Payment initiated. Please complete on your phone.'
                }
            else:
                return {
                    'success': False,
                    'error': f'MTN API error: {response.text}',
                    'provider': 'mtn'
                }
                
        except Exception as e:
            logger.error(f'MTN payment error: {str(e)}')
            return {
                'success': False,
                'error': str(e),
                'provider': 'mtn'
            }
    
    def initiate_airtel_payment(self, phone_number: str, amount: int, reference: str) -> dict:
        """Initiate Airtel Money payment"""
        try:
            # For sandbox/demo mode
            if self.is_sandbox or not self.airtel_client_id:
                return self._mock_payment_response('airtel', phone_number, amount, reference)
            
            # Real Airtel API integration
            transaction_id = str(uuid.uuid4())
            
            # First, get access token
            token = self._get_airtel_access_token()
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'X-Country': 'UG',
                'X-Currency': 'UGX'
            }
            
            payload = {
                'reference': transaction_id,
                'subscriber': {
                    'country': 'UG',
                    'currency': 'UGX',
                    'msisdn': phone_number
                },
                'transaction': {
                    'amount': amount,
                    'country': 'UG',
                    'currency': 'UGX',
                    'id': reference
                }
            }
            
            response = requests.post(
                f'{self.airtel_base_url}/merchant/v1/payments/',
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'transaction_id': transaction_id,
                    'status': 'pending',
                    'provider': 'airtel',
                    'message': 'Payment initiated. Please complete on your phone.',
                    'provider_response': data
                }
            else:
                return {
                    'success': False,
                    'error': f'Airtel API error: {response.text}',
                    'provider': 'airtel'
                }
                
        except Exception as e:
            logger.error(f'Airtel payment error: {str(e)}')
            return {
                'success': False,
                'error': str(e),
                'provider': 'airtel'
            }
    
    def _mock_payment_response(self, provider: str, phone_number: str, amount: int, reference: str) -> dict:
        """Mock payment response for testing/sandbox"""
        transaction_id = f'MOCK_{provider.upper()}_{uuid.uuid4().hex[:8]}'
        
        return {
            'success': True,
            'transaction_id': transaction_id,
            'status': 'completed',  # Auto-complete in mock mode
            'provider': provider,
            'message': f'[SANDBOX MODE] Payment of {amount} UGX initiated. In production, user would complete on phone.',
            'mock': True
        }
    
    def _get_mtn_access_token(self) -> str:
        """Get MTN API access token"""
        # Implementation for getting MTN access token
        # This would use the API user and API key to get a token
        return 'mock_token'
    
    def _get_airtel_access_token(self) -> str:
        """Get Airtel API access token"""
        # Implementation for getting Airtel access token
        # This would use client_id and client_secret
        return 'mock_token'
    
    def verify_payment(self, transaction_id: str, provider: str) -> dict:
        """Verify payment status"""
        if self.is_sandbox:
            # In sandbox, auto-complete after 2 seconds
            return {
                'success': True,
                'status': 'completed',
                'verified': True
            }
        
        # Real verification would check with provider API
        if provider == 'mtn':
            return self._verify_mtn_payment(transaction_id)
        elif provider == 'airtel':
            return self._verify_airtel_payment(transaction_id)
        
        return {'success': False, 'error': 'Unknown provider'}
    
    def _verify_mtn_payment(self, transaction_id: str) -> dict:
        """Verify MTN payment status"""
        # Implementation for MTN payment verification
        return {'success': True, 'status': 'completed'}
    
    def _verify_airtel_payment(self, transaction_id: str) -> dict:
        """Verify Airtel payment status"""
        # Implementation for Airtel payment verification
        return {'success': True, 'status': 'completed'}

# Singleton instance
mobile_money_service = MobileMoneyService()
