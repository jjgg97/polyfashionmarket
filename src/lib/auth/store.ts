export interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  walletAddress?: string;
}

const USERS_KEY = 'pfm_users';
const SESSION_KEY = 'pfm_session';

export function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): StoredUser | null {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserByUsername(username: string): StoredUser | null {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export function createUser(email: string, username: string, password: string): StoredUser {
  const users = getUsers();
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function hashPassword(password: string): string {
  let hash = 0;
  const str = password + 'pfm_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function setSession(userId: string) {
  const token = btoa(userId + ':' + Date.now());
  localStorage.setItem(SESSION_KEY, token);
}

export function getSession(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(SESSION_KEY);
  if (!token) return null;
  try { const decoded = atob(token); return decoded.split(':')[0]; }
  catch { return null; }
}

export function clearSession() { localStorage.removeItem(SESSION_KEY); }

export function getCurrentUser(): StoredUser | null {
  const userId = getSession();
  if (!userId) return null;
  return getUsers().find(u => u.id === userId) || null;
}
