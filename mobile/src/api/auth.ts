import client from './client';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }),
  register: (email: string, password: string, display_name: string) =>
    client.post<AuthResponse>('/auth/register', { email, password, display_name }),
  me: () => client.get<UserProfile>('/auth/me'),
  logout: (refresh_token: string) => client.post('/auth/logout', { refresh_token }),
};
