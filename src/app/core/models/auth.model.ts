export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  celular?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  token: string;
  roles: string[];
}