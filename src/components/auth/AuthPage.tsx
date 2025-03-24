import React from 'react';
import PhoneAuth from './PhoneAuth';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Redirect to home if already authenticated
  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to AceSphere
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your recruitment management platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PhoneAuth />
      </div>
    </div>
  );
};

export default AuthPage;