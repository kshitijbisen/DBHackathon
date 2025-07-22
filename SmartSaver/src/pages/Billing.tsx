import React, { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Download, RefreshCw } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

const Billing: React.FC = () => {
  const { subscription, loading, cancelSubscription } = useSubscription();
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    setMessage(null);

    const { error } = await cancelSubscription();
    
    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({ type: 'success', text: 'Subscription cancelled successfully. You\'ll retain access until the end of your billing period.' });
    }

    setCancelling(false);
  };

  const mockInvoices = [
    {
      id: 'inv_001',
      date: '2024-01-01',
      amount: 9.99,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Jan 1 - Jan 31, 2024'
    },
    {
      id: 'inv_002',
      date: '2023-12-01',
      amount: 9.99,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Dec 1 - Dec 31, 2023'
    },
    {
      id: 'inv_003',
      date: '2023-11-01',
      amount: 9.99,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Nov 1 - Nov 30, 2023'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and view billing history</p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-500" />
                Current Subscription
              </h2>

              {subscription ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subscription.plan_name} Plan</h3>
                      <p className="text-gray-600">
                        Status: <span className={`font-medium ${
                          subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        {subscription.cancel_at_period_end 
                          ? `Cancels on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                          : `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${subscription.plan_name === 'Pro' ? '9.99' : '19.99'}
                      </p>
                      <p className="text-gray-500">per month</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Change Plan</span>
                    </button>
                    
                    {!subscription.cancel_at_period_end && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        {cancelling ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Cancel Subscription</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-orange-800">Subscription Cancelled</p>
                          <p className="text-orange-700 text-sm">
                            Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}. 
                            You'll automatically switch to the free plan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-6">You're currently on the free plan. Upgrade to unlock premium features!</p>
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                    View Plans
                  </button>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Billing History
              </h2>

              {mockInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{invoice.plan}</p>
                              <p className="text-sm text-gray-500">{invoice.period}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900">
                            ${invoice.amount.toFixed(2)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1">
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No billing history available</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/25</p>
                </div>
              </div>
              <button className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                Update Payment Method
              </button>
            </div>

            {/* Next Billing */}
            {subscription && !subscription.cancel_at_period_end && (
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-4">Next Billing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>${subscription.plan_name === 'Pro' ? '9.99' : '19.99'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span>{subscription.plan_name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Support */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
                  Contact Billing Support
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
                  View Billing FAQ
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
                  Request Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;