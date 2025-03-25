import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber, 
  ConfirmationResult, 
  RecaptchaVerifier 
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  phoneSignIn: (phoneNumber: string) => Promise<ConfirmationResult>;
  confirmOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign in with phone number
  const phoneSignIn = async (phoneNumber: string) => {
    try {
      // Create a new recaptcha verifier each time
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'isolated': true // Prevent automatic verification
      });
      
      console.log('Starting phone verification for:', phoneNumber);
      const confirmationResult = await firebaseSignInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      // Clear the recaptcha after use
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.log('Error clearing reCAPTCHA');
      }
      
      return confirmationResult;
    } catch (error: any) {
      console.error('Error during phone sign in:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please include country code (+91 for IND).');
      } else if (error.code === 'auth/captcha-check-failed') {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('SMS quota exceeded. Please try again later.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to send verification code. Please try again.');
      }
    }
  };

  // Confirm OTP
  const confirmOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error during OTP confirmation:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid verification code. Please try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('Verification code has expired. Please request a new code.');
      } else {
        throw new Error(error.message || 'Failed to verify code. Please try again.');
      }
    }
  };

  // Logout function
  const logout = async () => {
    return auth.signOut();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    phoneSignIn,
    confirmOtp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};