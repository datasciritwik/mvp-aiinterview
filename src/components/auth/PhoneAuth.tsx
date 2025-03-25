import React, { useState } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

const PhoneAuth: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { phoneSignIn, confirmOtp, currentUser } = useAuth();

  // Handle phone number input change without triggering verification
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  // Format the phone number to ensure it has a country code
  const formatPhoneNumber = (value: string) => {
    // Add the country code if not present
    if (value && !value.startsWith('+')) {
      return `+${value}`;
    }
    return value;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validate phone number format first
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      if (!/^\+[1-9]\d{1,14}$/.test(formattedPhoneNumber)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +91 for IND)');
      }
      
      console.log('Starting phone verification for:', formattedPhoneNumber);
      const result = await phoneSignIn(formattedPhoneNumber);
      console.log('Phone verification started successfully');
      setConfirmationResult(result);
      setStep('otp');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!confirmationResult) {
      setError('Missing confirmation result. Please restart the verification process.');
      setLoading(false);
      return;
    }
    
    try {
      await confirmOtp(confirmationResult, otp);
      // Success - will be handled by the auth state change
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">You're signed in!</h2>
        <p className="text-gray-600 mb-4 text-center">
          Phone number: {currentUser.phoneNumber}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
        {step === 'phone' ? 'Sign in with Phone Number' : 'Enter Verification Code'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="+912345678900"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +91 for IND)
            </p>
          </div>

          {/* Hidden container for reCAPTCHA */}
          <div id="recaptcha-container" className="hidden"></div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || !phoneNumber}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the 6-digit code"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full mt-2 bg-transparent text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            Back to Phone Number
          </button>
        </form>
      )}
    </div>
  );
};

export default PhoneAuth;