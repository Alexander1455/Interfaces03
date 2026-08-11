export type UserRole = 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE';

export interface LoginRequest {
  email: string;
  clave: string;
}

export interface AuthResponse {
  token: string;
  usuario: UsuarioSesion;
  expiraEn: number;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  avatar?: string;
}

export interface JwtPayload {
  sub: string;
  id: number;
  nombre: string;
  rol: UserRole;
  iat: number;
  exp: number;
}
