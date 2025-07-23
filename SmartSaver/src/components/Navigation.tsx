import React, { useState } from 'react';
import { Plus, BarChart3, MessageCircle, User, CreditCard, Menu, X, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'add', label: 'Add Expense', icon: Plus },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'accounts', label: 'Accounts', icon: Building2 },
    { id: 'ai', label: 'AI Assistant', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handlePageChange = (page: string) => {
    console.log('Navigation: Changing page to', page); // Debug log
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    onPageChange('home');
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SmartSaver
                </span>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
                {/* Pricing Button */}
                <button
                  onClick={() => handlePageChange('pricing')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Upgrade</span>
                </button>
                
                {/* Profile Image Only */}
                <img 
                  src="/download.png" 
                  alt="Profile"
                  className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all duration-200"
                  onClick={() => handlePageChange('profile')}
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={handleOverlayClick}
          />
          
          {/* Slide-out Menu */}
          <div className={`fixed top-0 right-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <button 
                  onClick={handleLogoClick}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    SmartSaver
                  </span>
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info - Profile Image Only */}
              <div className="flex items-center justify-center p-6 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => handlePageChange('profile')}
                  className="flex flex-col items-center space-y-2 hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/download.png" 
                    alt="Profile"
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-purple-200"
                  />
                  <span className="text-sm text-gray-600">View Profile</span>
                </button>
              </div>

              {/* Pricing Button - Mobile */}
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={() => handlePageChange('pricing')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="flex-1 p-6">
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          console.log('Mobile nav: Clicking', item.id); // Debug log
                          handlePageChange(item.id);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  SmartSaver - Your AI-Powered Finance Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;