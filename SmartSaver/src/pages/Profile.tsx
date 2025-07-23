import React, { useState, useRef } from 'react';
import { User, Mail, Calendar, Settings, Edit3, Save, X, Camera, Shield, Bell, CreditCard, Upload, CheckCircle, AlertCircle, Key, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '../hooks/useNotifications';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { expenses } = useExpenses();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { sendNotification, sending: notificationSending } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Change email form state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
    currentPassword: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    location: '',
    bio: '',
    monthly_income: '',
    savings_goal: '',
    financial_goals: [] as string[],
    notifications_enabled: true,
    two_factor_enabled: false
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        monthly_income: profile.monthly_income?.toString() || '',
        savings_goal: profile.savings_goal?.toString() || '',
        financial_goals: profile.financial_goals || [],
        notifications_enabled: true,
        two_factor_enabled: false
      });
    }
  }, [profile]);

  // Calculate user statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoriesUsed = new Set(expenses.map(exp => exp.category)).size;
  const joinDate = user?.created_at ? new Date(user.created_at) : new Date();
  const daysActive = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 1000));

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updates = {
        display_name: formData.display_name,
        phone: formData.phone || null,
        location: formData.location || null,
        bio: formData.bio || null,
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        savings_goal: formData.savings_goal ? parseFloat(formData.savings_goal) : null,
        financial_goals: formData.financial_goals
      };

      const { error } = await updateProfile(updates);

      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        monthly_income: profile.monthly_income?.toString() || '',
        savings_goal: profile.savings_goal?.toString() || '',
        financial_goals: profile.financial_goals || [],
        notifications_enabled: true,
        two_factor_enabled: false
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    try {
      const { error } = await uploadAvatar(file);
      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    }
  };

  const addFinancialGoal = () => {
    const newGoal = prompt('Enter a new financial goal:');
    if (newGoal && newGoal.trim()) {
      handleInputChange('financial_goals', [...formData.financial_goals, newGoal.trim()]);
    }
  };

  const removeFinancialGoal = (index: number) => {
    const updatedGoals = formData.financial_goals.filter((_, i) => i !== index);
    handleInputChange('financial_goals', updatedGoals);
  };

  const handle2FASetup = () => {
    setShow2FAModal(true);
    setTwoFactorStep('setup');
    // Generate a mock QR code URL for demonstration
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SmartSaver:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=SmartSaver`);
  };

  const verify2FACode = async () => {
    // In a real implementation, this would verify the code with your backend
    if (verificationCode.length === 6) {
      setTwoFactorStep('success');
      handleInputChange('two_factor_enabled', true);
      
      // Send security alert notification
      try {
        const result = await sendNotification('security_alert', {
          action: 'Two-Factor Authentication enabled',
          ipAddress: 'Unknown' // In production, you'd get the real IP
        });
        
        if (result.success) {
          console.log('✅ Security notification sent successfully');
        }
      } catch (error) {
        console.warn('Failed to send security notification:', error);
      }
      
      setTimeout(() => {
        setShow2FAModal(false);
        setMessage({ type: 'success', text: 'Two-Factor Authentication enabled successfully!' });
        setVerificationCode('');
      }, 2000);
    } else {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
    }
  };

  const disable2FA = async () => {
    if (confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      handleInputChange('two_factor_enabled', false);
      
      // Send security alert notification
      try {
        const result = await sendNotification('security_alert', {
          action: 'Two-Factor Authentication disabled',
          ipAddress: 'Unknown'
        });
        
        if (result.success) {
          console.log('✅ Security notification sent successfully');
        }
      } catch (error) {
        console.warn('Failed to send security notification:', error);
      }
      
      setMessage({ type: 'success', text: 'Two-Factor Authentication disabled' });
    }
  };

  const toggle2FA = () => {
    if (formData.two_factor_enabled) {
      disable2FA();
    } else {
      handle2FASetup();
    }
  };

  const sendTestNotification = async () => {
    try {
      const result = await sendNotification('spending_summary', {
        period: 'Weekly',
        totalSpent: totalExpenses,
        transactionCount: expenses.length,
        topCategories: [
          { category: 'Food', amount: 150 },
          { category: 'Transport', amount: 80 },
          { category: 'Entertainment', amount: 60 }
        ],
        insights: 'You\'re doing great with your spending this week! Consider setting aside more for savings.'
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Test notification sent! Check the browser console to see the demo email.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to send test notification' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test notification' });
    }
  };

  // Handle change email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      setMessage({ type: 'error', text: 'Email addresses do not match' });
      return;
    }

    if (!emailForm.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    setEmailLoading(true);
    
    try {
      // Simulate the email change process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send security notification
      const result = await sendNotification('security_alert', {
        action: `Email change requested to ${emailForm.newEmail}`,
        ipAddress: 'Unknown'
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Email change request sent! Check the browser console to see the demo notification.' });
      } else {
        setMessage({ type: 'success', text: 'Email change request processed (notification service unavailable).' });
      }
      
      setShowChangeEmailModal(false);
      setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change email. Please try again.' });
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    if (!passwordForm.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    setPasswordLoading(true);
    
    try {
      // Simulate the password change process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send security notification
      const result = await sendNotification('security_alert', {
        action: 'Password changed',
        ipAddress: 'Unknown'
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully! Security notification sent.' });
      } else {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
      }
      
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password and try again.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-32 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              {/* Profile Image */}
              <div className="relative mb-4 md:mb-0">
                <img 
                  src={profile?.avatar_url || "/download.png"} 
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile?.display_name || 'User'}
                    </h1>
                    <p className="text-gray-600 mb-2">{user?.email}</p>
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-500 text-sm">
                        SmartSaver member since {joinDate.toLocaleDateString()}
                      </p>
                      {formData.two_factor_enabled && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          <Shield className="w-3 h-3" />
                          <span>2FA Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message.text}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-500" />
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">{profile?.display_name || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 py-3">{user?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">{profile?.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">{profile?.location || 'Not provided'}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900 py-3">{profile?.bio || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                Financial Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly_income}
                      onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">
                      {profile?.monthly_income ? `$${profile.monthly_income.toFixed(2)}` : 'Not provided'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Savings Goal</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.savings_goal}
                      onChange={(e) => handleInputChange('savings_goal', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">
                      {profile?.savings_goal ? `$${profile.savings_goal.toFixed(2)}` : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Financial Goals</label>
                  {isEditing && (
                    <button
                      onClick={addFinancialGoal}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      + Add Goal
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.financial_goals.map((goal, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
                    >
                      <span>{goal}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeFinancialGoal(index)}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {formData.financial_goals.length === 0 && (
                    <p className="text-gray-500 text-sm">No financial goals set</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-500" />
                Account Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about your expenses and insights</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.notifications_enabled}
                        onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    <button
                      onClick={sendTestNotification}
                      disabled={notificationSending}
                      className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                    >
                      {notificationSending ? 'Sending...' : 'Test'}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {formData.two_factor_enabled && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Enabled</span>
                      </div>
                    )}
                    <button 
                      onClick={toggle2FA}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        formData.two_factor_enabled 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {formData.two_factor_enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Account Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days Active</span>
                  <span className="font-semibold text-gray-900">{daysActive}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-gray-900">${totalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-semibold text-gray-900">{expenses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories Used</span>
                  <span className="font-semibold text-gray-900">{categoriesUsed}</span>
                </div>
              </div>
            </div>

            {/* Interactive Security Status */}
            <div className={`rounded-xl p-6 text-white transition-all duration-300 ${
              formData.two_factor_enabled 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              <h3 className="font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Password Protection</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors duration-200" onClick={toggle2FA}>
                  <span>Two-Factor Auth</span>
                  <div className="flex items-center space-x-2">
                    {formData.two_factor_enabled ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    <button className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors duration-200">
                      {formData.two_factor_enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Verified</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm mt-4 opacity-90">
                {formData.two_factor_enabled 
                  ? 'Your SmartSaver account is well protected!' 
                  : 'Consider enabling 2FA for better security'
                }
              </p>
            </div>

            {/* Achievement Badges */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium">First Expense</p>
                    <p className="text-sm text-purple-100">Started tracking expenses</p>
                  </div>
                </div>
                {expenses.length >= 10 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                    <div>
                      <p className="font-medium">Data Collector</p>
                      <p className="text-sm text-purple-100">Logged 10+ expenses</p>
                    </div>
                  </div>
                )}
                {categoriesUsed >= 5 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🏷️</span>
                    </div>
                    <div>
                      <p className="font-medium">Category Master</p>
                      <p className="text-sm text-purple-100">Used 5+ categories</p>
                    </div>
                  </div>
                )}
                {formData.two_factor_enabled && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🔒</span>
                    </div>
                    <div>
                      <p className="font-medium">Security Expert</p>
                      <p className="text-sm text-purple-100">Enabled 2FA protection</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowChangeEmailModal(true)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Change Email</span>
                </button>
                <button 
                  onClick={() => setShowChangePasswordModal(true)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                >
                  <Key className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Change Password</span>
                </button>
                <button 
                  onClick={toggle2FA}
                  className="w-full text-left p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 flex items-center space-x-3 text-purple-600"
                >
                  <Shield className="w-4 h-4" />
                  <span>{formData.two_factor_enabled ? 'Manage 2FA' : 'Setup 2FA'}</span>
                </button>
                <button 
                  onClick={signOut}
                  className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600"
                >
                  <User className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Email Modal */}
        {showChangeEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Change Email Address</h3>
                <p className="text-gray-600">Enter your new email address and current password</p>
              </div>

              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter new email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Email</label>
                  <input
                    type="email"
                    value={emailForm.confirmEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm new email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangeEmailModal(false);
                      setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {emailLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      'Change Email'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password</h3>
                <p className="text-gray-600">Enter your current password and choose a new one</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2FA Setup Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              {twoFactorStep === 'setup' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enable Two-Factor Authentication</h3>
                    <p className="text-gray-600">Scan this QR code with your authenticator app</p>
                  </div>

                  <div className="text-center mb-6">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="mx-auto mb-4 border rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mb-4">
                      Use Google Authenticator, Authy, or any TOTP app
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter verification code from your app:
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShow2FAModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verify2FACode}
                      disabled={verificationCode.length !== 6}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Verify
                    </button>
                  </div>
                </>
              )}

              {twoFactorStep === 'success' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-6">Two-Factor Authentication has been enabled for your SmartSaver account.</p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 text-sm">
                      Your account is now more secure. You'll need to enter a code from your authenticator app when signing in.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;