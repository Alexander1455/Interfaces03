import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Curso, CursoCreateDto, CursoUpdateDto } from '../models/curso.model';
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
