import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      // Handle the specific case where user already exists
      if (error && error.message.includes('User already registered')) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: 'This email is already registered. Please sign in instead.' 
          } 
        };
      }

      // Send welcome email after successful registration
      if (!error && data.user) {
        try {
          await sendWelcomeEmail(data.user.email!, data.user.email?.split('@')[0] || 'User');
        } catch (emailError) {
          console.warn('Failed to send welcome email:', emailError);
          // Don't fail the registration if email fails
        }
      }

      return { data, error };
    } catch (err) {
      // Catch any unexpected errors and return a consistent format
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'An unexpected error occurred during signup' 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      // Catch any unexpected errors and return a consistent format
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'An unexpected error occurred during sign in' 
        } 
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};

// Welcome email function
const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification`;
    
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const requestData = {
      type: 'welcome',
      userEmail,
      userName,
      data: {
        registrationDate: new Date().toISOString(),
        features: [
          'Smart expense tracking',
          'AI-powered financial insights',
          'Interactive charts and analytics',
          'Budget management tools',
          'Secure data protection'
        ]
      }
    };

    console.log('Sending welcome email to:', userEmail);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Welcome email API error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Welcome email result:', result);

    if (result.success) {
      console.log('✅ Welcome email sent successfully to:', userEmail);
    } else {
      throw new Error(result.error || 'Unknown error from email service');
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    
    // For demo purposes, log the welcome email that would be sent
    console.log('📧 DEMO WELCOME EMAIL:');
    console.log(`To: ${userEmail}`);
    console.log(`From: SmartSaver <welcome@smartsaver.app>`);
    console.log(`Subject: 🎉 Welcome to SmartSaver - Your Financial Journey Starts Now!`);
    console.log(`Content: Hi ${userName}! Welcome to SmartSaver! We're excited to help you take control of your finances with our AI-powered tools and insights.`);
    console.log('Features included:');
    console.log('- Smart expense tracking');
    console.log('- AI-powered financial insights');
    console.log('- Interactive charts and analytics');
    console.log('- Budget management tools');
    console.log('- Secure data protection');
    console.log('---');
    
    // Don't throw error for demo purposes
  }
};