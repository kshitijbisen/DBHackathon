import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { createCheckoutSession } from '../services/stripeService';

const Pricing: React.FC = () => {
  const { user, session } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      period: 'month',
      description: 'Great for trying out the platform',
      icon: Star,
      color: 'from-gray-500 to-gray-600',
      features: [
        'Basic feature access',
        '5 requests/day',
        'Simple analytics',
        'Watermarked exports',
        'Community support',
        'Ad-supported experience'
      ],
      popular: false,
      stripePriceId: null
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      price: 10,
      period: 'month',
      description: 'Perfect for power users & small businesses',
      icon: Zap,
      color: 'from-purple-500 to-blue-500',
      features: [
        'Everything in Free, plus:',
        '50 requests/day (10x more)',
        'Advanced customization tools',
        'Priority email support',
        'Ad-free experience',
        'Enhanced analytics dashboard',
        'Professional-quality exports'
      ],
      popular: true,
      stripePriceId: 'price_1RbdzQFLuIzlW9kkrojaSToR'
    },
    {
      id: 'premium',
      name: 'Premium Tier',
      price: 20,
      period: 'month',
      description: 'Ideal for businesses & developers needing maximum capability',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      features: [
        'All Pro features, plus:',
        'Unlimited requests',
        '24/7 priority chat support',
        'White-labeling & branding',
        'Advanced reporting & insights',
        'Full API access',
        'Early access to new features',
        'Dedicated account manager'
      ],
      popular: false,
      stripePriceId: 'price_1RbdyVFLuIzlW9kkFgTmFzAW'
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      setError('Please sign in to subscribe to a plan');
      return;
    }

    if (!session?.access_token) {
      setError('Authentication session expired. Please sign in again.');
      return;
    }

    if (plan.id === 'free') {
      setError('You are already on the free plan!');
      return;
    }

    if (!plan.stripePriceId) {
      setError('This plan is not available for purchase yet. Please contact support.');
      return;
    }

    setLoadingPlan(plan.id);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('=== STRIPE CHECKOUT DEBUG ===');
      console.log('Plan:', plan.name);
      console.log('Price ID:', plan.stripePriceId);
      console.log('User:', user.email);
      console.log('Session exists:', !!session);
      console.log('Access token exists:', !!session?.access_token);
      console.log('Current URL:', window.location.href);
      console.log('Origin:', window.location.origin);
      
      // Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      
      console.log('Supabase URL:', supabaseUrl);
      console.log('Supabase Key exists:', !!supabaseKey);
      console.log('Stripe Key exists:', !!stripeKey);
      
      setDebugInfo({
        plan: plan.name,
        priceId: plan.stripePriceId,
        user: user.email,
        origin: window.location.origin,
        supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        hasStripeKey: !!stripeKey
      });

      // Test the edge function directly first
      const testUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
      console.log('Testing edge function URL:', testUrl);
      
      // Create real Stripe checkout session with user's access token
      const { url, error: checkoutError, sessionId } = await createCheckoutSession(plan.stripePriceId, session.access_token);
      
      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        setError(`Checkout error: ${checkoutError}`);
        return;
      }
      
      if (url) {
        console.log('✅ Checkout session created successfully');
        console.log('Session ID:', sessionId);
        console.log('Checkout URL:', url);
        console.log('URL starts with checkout.stripe.com:', url.startsWith('https://checkout.stripe.com/'));
        
        // Validate URL format
        if (!url.startsWith('https://checkout.stripe.com/')) {
          setError(`Invalid checkout URL format: ${url}`);
          return;
        }
        
        // Store current page before redirect so we can return if needed
        sessionStorage.setItem('preCheckoutPage', 'pricing');
        sessionStorage.setItem('checkoutPlan', plan.id);
        
        console.log('🚀 Redirecting to Stripe checkout...');
        
        // Try different redirect methods
        try {
          // Method 1: Direct assignment (most reliable)
          window.location.href = url;
        } catch (redirectError) {
          console.error('Direct redirect failed:', redirectError);
          
          // Method 2: Using window.open as fallback
          const checkoutWindow = window.open(url, '_self');
          if (!checkoutWindow) {
            setError('Popup blocked. Please allow popups and try again, or copy this URL: ' + url);
          }
        }
      } else {
        setError('Failed to create checkout session. No URL returned.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError(`Something went wrong: ${error.message}`);
      
      // Additional debugging for network errors
      if (error.message.includes('fetch')) {
        console.error('Network error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setError('Network error: Unable to connect to payment service. Please check your internet connection and try again.');
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return 'free';
    return subscription.plan_name.toLowerCase();
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlan() === planId;
  };

  const getButtonText = (plan: typeof plans[0]) => {
    if (loadingPlan === plan.id) return 'Creating checkout...';
    if (isCurrentPlan(plan.id)) return 'Current Plan';
    if (plan.id === 'free') return 'Get Started Free';
    return 'Upgrade Now';
  };

  const getButtonDisabled = (plan: typeof plans[0]) => {
    return loadingPlan !== null || isCurrentPlan(plan.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Flexible Pricing Plans for
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Every Need
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect subscription plan to match your needs and budget
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Check className="w-4 h-4 text-green-500" />
            <span>Start free, upgrade anytime</span>
            <span className="mx-2">•</span>
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel or change plans at any time</span>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 border border-yellow-300 rounded-full px-6 py-3 shadow-lg">
            <CreditCard className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              🧪 Test Mode - Use card 4242 4242 4242 4242 for testing
            </span>
          </div>
        </div>

        {/* Current Subscription Status */}
        {user && !subscriptionLoading && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg border">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">
                Current Plan: {getCurrentPlan().charAt(0).toUpperCase() + getCurrentPlan().slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Payment Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Debug Information
              </h3>
              <div className="text-blue-800 space-y-1 text-sm">
                <p><strong>Plan:</strong> {debugInfo.plan}</p>
                <p><strong>Price ID:</strong> {debugInfo.priceId}</p>
                <p><strong>User:</strong> {debugInfo.user}</p>
                <p><strong>Origin:</strong> {debugInfo.origin}</p>
                <p><strong>Supabase URL:</strong> {debugInfo.supabaseUrl}</p>
                <p><strong>Has Supabase Key:</strong> {debugInfo.hasSupabaseKey ? '✅' : '❌'}</p>
                <p><strong>Has Stripe Key:</strong> {debugInfo.hasStripeKey ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            const isCurrent = isCurrentPlan(plan.id);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  isPopular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                } ${isCurrent ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Current
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    <p className="text-gray-600 text-sm italic">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className={`text-gray-700 ${
                          feature.includes('Everything in') || feature.includes('All Pro features') 
                            ? 'font-semibold text-purple-700' 
                            : ''
                        }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={getButtonDisabled(plan)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : plan.id === 'free'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{getButtonText(plan)}</span>
                        {!isCurrent && plan.id !== 'free' && <ArrowRight className="w-5 h-5" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Card Information */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Test Payment Information
            </h3>
            <div className="text-blue-800 space-y-2">
              <p><strong>Test Card Number:</strong> 4242 4242 4242 4242</p>
              <p><strong>Expiry:</strong> Any future date (e.g., 12/34)</p>
              <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
              <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
              <p className="text-sm mt-3 text-blue-700">
                💡 This will create a real Stripe checkout session in test mode. No actual charges will be made.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Test Cards */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Other Test Cards</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><strong>Visa:</strong> 4242 4242 4242 4242</p>
                <p><strong>Visa (debit):</strong> 4000 0566 5566 5556</p>
                <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
              </div>
              <div>
                <p><strong>American Express:</strong> 3782 822463 10005</p>
                <p><strong>Declined card:</strong> 4000 0000 0000 0002</p>
                <p><strong>Insufficient funds:</strong> 4000 0000 0000 9995</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Can I change plans anytime?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and digital wallets through 
                our secure Stripe payment processing.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-600">
                Our Free Tier gives you access to core features with no time limit. 
                Upgrade anytime to unlock more powerful capabilities.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. 
                Contact support if you're not satisfied with your subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who have taken control of their finances with our powerful tools and AI-driven insights.
            </p>
            <button
              onClick={() => handleSubscribe(plans[1])} // Pro plan
              disabled={loadingPlan !== null}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'pro' ? 'Creating checkout...' : 'Start Your Journey Today'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;