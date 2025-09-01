export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  error: string;
}
