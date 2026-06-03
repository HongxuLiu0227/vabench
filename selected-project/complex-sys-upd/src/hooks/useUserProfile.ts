import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userService';
import type { UserProfile, EditableProfileFields } from '../types';

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updatedFields: EditableProfileFields) => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      const updatedProfile = await updateUserProfile(profile.id, updatedFields);
      setProfile(updatedProfile);
      setIsEditing(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return {
    profile,
    isLoading,
    error,
    isEditing,
    updateProfile,
    toggleEditing,
  };
};
