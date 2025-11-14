import { useState, useEffect } from 'react';
import * as authService from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<{ user: authService.AuthUser; profile: authService.Profile; isPendingApproval?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      setUser(session);
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, accountType: 'reader' | 'publisher' = 'reader', cnpj?: string, birthDate?: string) => {
    const result = await authService.signUp(name, email, password, accountType, cnpj, birthDate);
    if (result) {
      setUser(result);
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result) {
      setUser(result);
    }
    return result;
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      // Ignore errors during logout, just clear local state
      console.log('Logout error (ignored):', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<authService.Profile>) => {
    if (!user) return null;
    const updatedProfile = await authService.updateProfile(user.profile.id, updates);
    if (updatedProfile) {
      setUser({
        ...user,
        profile: updatedProfile,
      });
    }
    return updatedProfile;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}