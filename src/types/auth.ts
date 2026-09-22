export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  provider: 'google' | 'password';
  lastLogin: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}
