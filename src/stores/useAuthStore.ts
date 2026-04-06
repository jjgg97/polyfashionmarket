'use client';
import { create } from 'zustand';
import { User } from '@/types';
import {
  findUserByEmail, findUserByUsername, createUser,
  verifyPassword, setSession, clearSession, getCurrentUser
} from '@/lib/auth/store';

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  hydrate: () => {
    const stored = getCurrentUser();
    if (stored) {
      set({ user: { id: stored.id, email: stored.email, username: stored.username, createdAt: stored.createdAt }, isLoggedIn: true });
    }
  },

  signup: async (email, username, password) => {
    set({ isLoading: true, error: null });
    if (!email || !username || !password) { set({ error: 'All fields are required.', isLoading: false }); return false; }
    if (password.length < 6) { set({ error: 'Password must be at least 6 characters.', isLoading: false }); return false; }
    if (username.length < 3) { set({ error: 'Username must be at least 3 characters.', isLoading: false }); return false; }
    if (findUserByEmail(email)) { set({ error: 'An account with this email already exists.', isLoading: false }); return false; }
    if (findUserByUsername(username)) { set({ error: 'Username is already taken.', isLoading: false }); return false; }
    const newUser = createUser(email, username, password);
    setSession(newUser.id);
    set({ user: { id: newUser.id, email: newUser.email, username: newUser.username, createdAt: newUser.createdAt }, isLoggedIn: true, isLoading: false, error: null });
    return true;
  },

  login: async (emailOrUsername, password) => {
    set({ isLoading: true, error: null });
    if (!emailOrUsername || !password) { set({ error: 'Please enter your email and password.', isLoading: false }); return false; }
    const user = findUserByEmail(emailOrUsername) || findUserByUsername(emailOrUsername);
    if (!user || !verifyPassword(password, user.passwordHash)) { set({ error: 'Invalid email or password.', isLoading: false }); return false; }
    setSession(user.id);
    set({ user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt }, isLoggedIn: true, isLoading: false, error: null });
    return true;
  },

  logout: () => { clearSession(); set({ user: null, isLoggedIn: false, error: null }); },
  clearError: () => set({ error: null }),
}));
