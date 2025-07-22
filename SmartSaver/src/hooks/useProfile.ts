import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  monthly_income?: number;
  savings_goal?: number;
  financial_goals: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows

      if (fetchError) {
        throw fetchError;
      }

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // Create default profile using upsert to handle race conditions
        const defaultProfile = {
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          bio: 'Financial wellness enthusiast focused on smart spending and saving goals.',
          financial_goals: ['Build Emergency Fund', 'Save for Vacation', 'Invest in Retirement']
        };

        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert(defaultProfile, { 
            onConflict: 'user_id',
            ignoreDuplicates: true 
          });

        if (upsertError) {
          throw upsertError;
        }

        // Fetch the profile after upsert to get the complete data
        const { data: newProfile, error: refetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (refetchError) {
          throw refetchError;
        }

        setProfile(newProfile);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !profile) return { error: 'User not authenticated or profile not loaded' };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await updateProfile({ avatar_url: data.publicUrl });
      
      if (updateError) throw new Error(updateError);

      return { data: data.publicUrl, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};