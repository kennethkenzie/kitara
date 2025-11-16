import React, { useState } from 'react';
import { Smartphone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const PaymentModal = ({ isOpen, onClose, episode, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setPaymentStatus({ success: false, message: 'Please enter a valid phone number' });
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/episode/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({
          episode_id: episode.id,
          phone_number: phoneNumber,
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transaction_id);
        
        if (data.access_granted) {
          // Sandbox mode - payment completed immediately
          setPaymentStatus({
            success: true,
            message: 'Payment successful! Episode unlocked.'
          });
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          setPaymentStatus({
            success: true,
            message: data.message || 'Please check your phone to complete the payment.'
          });
        }
      } else {
        setPaymentStatus({
          success: false,
          message: data.error || 'Payment failed. Please try again.'
        });
      }
    } catch (error) {
      setPaymentStatus({
        success: false,
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setPaymentStatus(null);
    setTransactionId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Unlock Episode</DialogTitle>
          <DialogDescription className="text-gray-400">
            Pay 200 UGX to unlock {episode?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-yellow-500 transition-colors cursor-pointer">
                <RadioGroupItem value="mtn" id="mtn" />
                <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black">
                      MTN
                    </div>
                    <div>
                      <p className="text-white font-medium">MTN Mobile Money</p>
                      <p className="text-xs text-gray-400">Pay with MTN MoMo</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-red-500 transition-colors cursor-pointer">
                <RadioGroupItem value="airtel" id="airtel" />
                <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-white">
                      A
                    </div>
                    <div>
                      <p className="text-white font-medium">Airtel Money</p>
                      <p className="text-xs text-gray-400">Pay with Airtel Money</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white font-medium">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                +256
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="700000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-gray-800 border-gray-700 text-white"
                maxLength={9}
              />
            </div>
            <p className="text-xs text-gray-500">Enter your {paymentMethod === 'mtn' ? 'MTN' : 'Airtel'} number without the country code</p>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              paymentStatus.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              {paymentStatus.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={paymentStatus.success ? 'text-green-300' : 'text-red-300'}>
                {paymentStatus.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || !phoneNumber || phoneNumber.length < 9}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5 mr-2" />
                  Pay 200 UGX
                </>
              )}
            </Button>
          </div>

          {/* Sandbox Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure payment powered by {paymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}
            </p>
            <p className="text-xs text-yellow-500 mt-1">
              [Sandbox Mode] In production, you'll complete payment on your phone
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
