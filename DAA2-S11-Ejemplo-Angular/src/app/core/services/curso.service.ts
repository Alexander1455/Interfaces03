import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Curso, CursoCreateDto, CursoUpdateDto, Matricula } from '../models/curso.model';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly API_URL = 'http://localhost:9090/api/cursos';

  constructor(
    private http: HttpClient,
    private mockBackend: MockBackendService
  ) {}

  public getCursos(): Observable<Curso[]> {
    return this.mockBackend.getCursos().pipe(
      catchError(this.handleError)
    );
  }

  public getCursoById(id: number): Observable<Curso> {
    return this.mockBackend.getCursoById(id).pipe(
      catchError(this.handleError)
    );
  }

  public crearCurso(dto: CursoCreateDto): Observable<Curso> {
    return this.mockBackend.createCurso(dto).pipe(
      catchError(this.handleError)
    );
  }

  public actualizarCurso(dto: CursoUpdateDto): Observable<Curso> {
    return this.mockBackend.updateCurso(dto).pipe(
      catchError(this.handleError)
    );
  }

  public eliminarCurso(id: number): Observable<boolean> {
    return this.mockBackend.deleteCurso(id).pipe(
      catchError(this.handleError)
    );
  }

  public getMatriculas(estudianteId?: number): Observable<Matricula[]> {
    return this.mockBackend.getMatriculas(estudianteId).pipe(
      catchError(this.handleError)
    );
  }

  public getCursosMatriculados(estudianteId: number): Observable<Curso[]> {
    return this.mockBackend.getCursosMatriculados(estudianteId).pipe(
      catchError(this.handleError)
    );
  }

  public matricularEstudiante(estudianteId: number, cursoId: number): Observable<Matricula> {
    return this.mockBackend.matricularEstudiante(estudianteId, cursoId).pipe(
      catchError(this.handleError)
    );
  }

  public desmatricularEstudiante(estudianteId: number, cursoId: number): Observable<boolean> {
    return this.mockBackend.desmatricularEstudiante(estudianteId, cursoId).pipe(
      catchError(this.handleError)
    );
  }

  public getMatriculasPorCurso(cursoId: number): Observable<Matricula[]> {
    return this.mockBackend.getMatriculasPorCurso(cursoId).pipe(
      catchError(this.handleError)
    );
  }

  public guardarNotasCurso(cursoId: number, notasList: any[]): Observable<Matricula[]> {
    return this.mockBackend.guardarNotasCurso(cursoId, notasList).pipe(
      catchError(this.handleError)
    );
  }

  public actualizarNotas(matriculaId: number, dto: any): Observable<Matricula> {
    return this.mockBackend.actualizarNotas(matriculaId, dto).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | any) {
    let errorMessage = 'Ocurrió un error al procesar los cursos.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error en CursoService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
