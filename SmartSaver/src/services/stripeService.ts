import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface CheckoutSessionResponse {
  url?: string;
  sessionId?: string;
  error?: string;
}

export const createCheckoutSession = async (priceId: string, accessToken?: string): Promise<CheckoutSessionResponse> => {
  try {
    console.log('🔄 Starting checkout session creation...');
    
    // Validate environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    if (!accessToken) {
      throw new Error('User must be authenticated to create checkout session');
    }

    // Clean the URL to ensure no trailing slash
    const cleanUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const apiUrl = `${cleanUrl}/functions/v1/create-checkout-session`;
    
    console.log('📡 API URL:', apiUrl);
    console.log('💳 Price ID:', priceId);
    console.log('🔑 Has access token:', !!accessToken);
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      'Referer': window.location.href
    };

    console.log('📤 Request headers:', {
      ...headers,
      'Authorization': 'Bearer [REDACTED]'
    });

    const requestBody = { priceId };
    console.log('📤 Request body:', requestBody);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      console.log('🚀 Making fetch request...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('❌ Parsed error data:', errorData);
        } catch (e) {
          // If we can't parse the error, use the status text
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      
      if (data.error) {
        console.error('❌ API returned error:', data.error);
        return { error: data.error };
      }

      if (!data.url) {
        console.error('❌ No checkout URL in response');
        return { error: 'No checkout URL received from server' };
      }

      // Validate the URL format
      if (!data.url.startsWith('https://checkout.stripe.com/')) {
        console.warn('⚠️ Unexpected checkout URL format:', data.url);
        // Don't fail here, as Stripe might change their URL format
      }

      console.log('✅ Checkout session created successfully');
      console.log('🔗 Checkout URL:', data.url);
      console.log('🆔 Session ID:', data.sessionId);

      return { 
        url: data.url,
        sessionId: data.sessionId 
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏰ Request timeout');
        throw new Error('Request timeout - please try again');
      }
      
      console.error('🌐 Network error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('💥 Stripe checkout error:', error);
    
    // Enhanced error handling with specific messages
    if (error.message.includes('Failed to fetch')) {
      return { error: 'Network error: Unable to connect to payment service. Please check your internet connection and try again.' };
    }
    
    if (error.message.includes('timeout')) {
      return { error: 'Request timeout: The payment service is taking too long to respond. Please try again.' };
    }
    
    if (error.message.includes('CORS')) {
      return { error: 'CORS error: There\'s a configuration issue with the payment service. Please contact support.' };
    }
    
    return { error: error instanceof Error ? error.message : 'Failed to create checkout session' };
  }
};

export const createPortalSession = async (accessToken?: string): Promise<CheckoutSessionResponse> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    if (!accessToken) {
      throw new Error('User must be authenticated to create portal session');
    }

    const cleanUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const apiUrl = `${cleanUrl}/functions/v1/create-portal-session`;
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Portal error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      return { error: data.error };
    }

    return { url: data.url };
  } catch (error) {
    console.error('Stripe portal error:', error);
    
    if (error.name === 'AbortError') {
      return { error: 'Request timeout - please try again' };
    }
    
    return { error: error instanceof Error ? error.message : 'Failed to create portal session' };
  }
};