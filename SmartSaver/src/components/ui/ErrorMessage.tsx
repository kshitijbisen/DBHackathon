import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-4 flex items-center space-x-3 max-w-sm">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-red-800 font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;