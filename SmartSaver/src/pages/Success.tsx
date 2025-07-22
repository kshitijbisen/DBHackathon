import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Success: React.FC = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    setSessionId(sessionIdParam);
  }, []);

  const handleGoToDashboard = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your subscription! Your SmartSaver account has been upgraded and you now have access to all premium features.
        </p>

        {/* Session Info */}
        {sessionId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Session ID:</strong> {sessionId.slice(0, 20)}...
            </p>
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-700">
              <strong>Account:</strong> {user.email}
            </p>
          </div>
        )}

        {/* What's Next */}
        <div className="text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What's next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Access to premium features is now active</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>You'll receive a confirmation email shortly</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Manage your subscription in your profile</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => window.location.href = '/profile'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            Manage Subscription
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@smartsaver.com" className="text-purple-600 hover:text-purple-700">
              support@smartsaver.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;