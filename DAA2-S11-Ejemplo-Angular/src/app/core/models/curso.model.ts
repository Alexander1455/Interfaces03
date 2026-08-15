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
  fechaInicio: string;
  fechaFin: string;
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
  fechaInicio: string;
  fechaFin: string;
}

export interface CursoUpdateDto extends CursoCreateDto {
  id: number;
}

export interface Matricula {
  id: number;
  estudianteId: number;
  estudianteNombre?: string;
  estudianteCodigo?: string;
  estudianteEmail?: string;
  cursoId: number;
  cursoNombre?: string;
  cursoCodigo?: string;
  fechaMatricula: string;
  notaEC1?: number | null; // Evaluación Continua 1 (0-20, 20%)
  notaEC2?: number | null; // Evaluación Continua 2 (0-20, 20%)
  notaEC3?: number | null; // Evaluación Continua 3 (0-20, 20%)
  notaEF?: number | null;  // Examen Final (0-20, 40%)
  promedioFinal?: number | null; // Promedio ponderado (0-20)
  estadoAcademico?: 'APROBADO' | 'DESAPROBADO' | 'EN_CURSO';
  observaciones?: string;
}

export interface ActualizarNotaItemDto {
  matriculaId: number;
  notaEC1?: number | null;
  notaEC2?: number | null;
  notaEC3?: number | null;
  notaEF?: number | null;
  observaciones?: string;
}

export interface BoletaCalificacionDto {
  cursoId: number;
  codigoCurso: string;
  nombreCurso: string;
  creditos: number;
  docenteNombre: string;
  horario: string;
  notaEC1?: number | null;
  notaEC2?: number | null;
  notaEC3?: number | null;
  notaEF?: number | null;
  promedioFinal?: number | null;
  estadoAcademico: 'APROBADO' | 'DESAPROBADO' | 'EN_CURSO';
  observaciones?: string;
}
