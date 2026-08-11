import { UserRole } from './auth.model';

export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
  codigoInstitucional: string;
  estado: boolean;
  telefono?: string;
  fechaCreacion: string;
}

export interface UsuarioCreateDto {
  nombreCompleto: string;
  email: string;
  clave: string;
  rol: UserRole;
  codigoInstitucional: string;
  estado: boolean;
  telefono?: string;
}

export interface UsuarioUpdateDto {
  id: number;
  nombreCompleto: string;
  email: string;
  clave?: string;
  rol: UserRole;
  codigoInstitucional: string;
  estado: boolean;
  telefono?: string;
}
