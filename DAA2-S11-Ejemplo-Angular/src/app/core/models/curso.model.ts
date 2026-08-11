export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  creditos: number;
  docenteId: number;
  docenteNombre: string;
  cuposDisponibles: number;
  cuposTotales: number;
  estado: boolean; // true = Activo, false = Inactivo
  horario: string;
}

export interface CursoCreateDto {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  creditos: number;
  docenteId: number;
  cuposTotales: number;
  estado: boolean;
  horario: string;
}

export interface CursoUpdateDto extends CursoCreateDto {
  id: number;
}
