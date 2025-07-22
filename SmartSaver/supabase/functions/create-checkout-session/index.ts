/*
  # Create Stripe Checkout Session
  
  This function creates a Stripe checkout session for subscription payments.
  It handles the creation of checkout sessions and redirects users to Stripe's hosted checkout page.
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Origin, Referer",
};

interface CheckoutRequest {
  priceId: string;
}

Deno.serve(async (req: Request) => {
  console.log('🚀 Checkout session request received');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === "OPTIONS") {
    console.log('✅ Handling CORS preflight');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Log environment variables (without exposing secrets)
    console.log('🔧 Environment check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!Deno.env.get('STRIPE_SECRET_KEY'));
    console.log('- SUPABASE_URL exists:', !!Deno.env.get('SUPABASE_URL'));
    console.log('- SUPABASE_ANON_KEY exists:', !!Deno.env.get('SUPABASE_ANON_KEY'));
    
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      throw new Error('Stripe configuration is missing');
    }

    // Parse request body
    const requestText = await req.text();
    console.log('📥 Raw request body:', requestText);
    
    let requestData: CheckoutRequest;
    try {
      requestData = JSON.parse(requestText);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { priceId } = requestData;
    
    if (!priceId) {
      console.error('❌ Price ID is missing');
      throw new Error('Price ID is required');
    }

    console.log('💳 Creating checkout session for price:', priceId);

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Authorization header is missing');
      throw new Error('Authorization header is required');
    }

    console.log('🔑 Authorization header present');

    // Create Supabase client to get user info
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables missing');
      throw new Error('Supabase environment variables are not set');
    }

    console.log('🔗 Supabase URL:', supabaseUrl);

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the authenticated user
    console.log('👤 Getting authenticated user...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User authentication error:', userError);
      throw new Error('User not authenticated');
    }

    console.log('✅ Authenticated user:', user.email);

    // Get origin for redirect URLs with multiple fallbacks
    const origin = req.headers.get('origin') || 
                  req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 
                  'http://localhost:5173';
    
    console.log('🌐 Using origin for redirects:', origin);

    // Validate origin format
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
      console.warn('⚠️ Invalid origin format, using default');
      const fallbackOrigin = 'http://localhost:5173';
      console.log('🔄 Fallback origin:', fallbackOrigin);
    }

    // Create checkout session using Stripe API directly with fetch
    const stripeApiUrl = 'https://api.stripe.com/v1/checkout/sessions';
    
    const formData = new URLSearchParams();
    formData.append('mode', 'subscription');
    formData.append('line_items[0][price]', priceId);
    formData.append('line_items[0][quantity]', '1');
    formData.append('success_url', `${origin}/success?session_id={CHECKOUT_SESSION_ID}`);
    formData.append('cancel_url', `${origin}/pricing`);
    formData.append('billing_address_collection', 'auto');
    formData.append('customer_email', user.email || '');
    formData.append('metadata[user_id]', user.id);
    formData.append('subscription_data[metadata][user_id]', user.id);
    formData.append('allow_promotion_codes', 'true');
    
    // Add payment method types for better compatibility
    formData.append('payment_method_types[0]', 'card');

    console.log('📤 Stripe API request details:');
    console.log('- URL:', stripeApiUrl);
    console.log('- Price ID:', priceId);
    console.log('- Customer email:', user.email);
    console.log('- Success URL:', `${origin}/success?session_id={CHECKOUT_SESSION_ID}`);
    console.log('- Cancel URL:', `${origin}/pricing`);

    console.log('🚀 Making request to Stripe API...');

    const stripeResponse = await fetch(stripeApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2023-10-16',
        'User-Agent': 'SmartSaver/1.0',
      },
      body: formData.toString(),
    });

    console.log('📥 Stripe response status:', stripeResponse.status);
    console.log('📥 Stripe response headers:', Object.fromEntries(stripeResponse.headers.entries()));

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('❌ Stripe API error response:', errorText);
      
      let errorMessage = 'Stripe API error';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
        console.error('❌ Parsed Stripe error:', errorData);
      } catch (e) {
        // If we can't parse the error, use the raw text
        errorMessage = errorText;
      }
      
      throw new Error(`Stripe API error: ${stripeResponse.status} - ${errorMessage}`);
    }

    const session = await stripeResponse.json();
    console.log('✅ Checkout session created successfully');
    console.log('🆔 Session ID:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    // Validate that we got a proper checkout URL
    if (!session.url) {
      console.error('❌ No checkout URL returned from Stripe');
      throw new Error('No checkout URL returned from Stripe');
    }

    // Additional validation
    if (!session.url.startsWith('https://checkout.stripe.com/')) {
      console.warn('⚠️ Unexpected checkout URL format:', session.url);
      // Don't fail here, as Stripe might change their URL format
    }

    console.log('🎉 Returning successful response');

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
        success: true
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error('💥 Checkout session error:', error);
    
    const errorResponse = {
      error: error.message || 'Failed to create checkout session',
      details: error.toString(),
      timestamp: new Date().toISOString(),
      success: false
    };
    
    console.log('❌ Returning error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});