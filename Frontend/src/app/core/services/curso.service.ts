import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Curso, CursoCreateDto, CursoUpdateDto, Matricula } from '../models/curso.model';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly API_URL = 'http://localhost:9090/api/cursos';
  private readonly MATRICULAS_URL = 'http://localhost:9090/api/matriculas';

  constructor(
    private http: HttpClient,
    private mockBackend: MockBackendService
  ) {}

  public getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.API_URL).pipe(
      catchError((error) => {
        console.warn('⚠️ [CursoService] Fallback a mock:', error);
        return this.mockBackend.getCursos();
      })
    );
  }

  public getCursoById(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.API_URL}/${id}`).pipe(
      catchError(() => this.mockBackend.getCursoById(id))
    );
  }

  public crearCurso(dto: CursoCreateDto): Observable<Curso> {
    return this.http.post<Curso>(this.API_URL, dto).pipe(
      catchError(() => this.mockBackend.createCurso(dto))
    );
  }

  public actualizarCurso(dto: CursoUpdateDto): Observable<Curso> {
    return this.http.put<Curso>(`${this.API_URL}/${dto.id}`, dto).pipe(
      catchError(() => this.mockBackend.updateCurso(dto))
    );
  }

  public eliminarCurso(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API_URL}/${id}`).pipe(
      catchError(() => this.mockBackend.deleteCurso(id))
    );
  }

  public getMatriculas(estudianteId?: number): Observable<Matricula[]> {
    const url = estudianteId ? `${this.MATRICULAS_URL}?estudianteId=${estudianteId}` : this.MATRICULAS_URL;
    return this.http.get<Matricula[]>(url).pipe(
      catchError(() => this.mockBackend.getMatriculas(estudianteId))
    );
  }

  public getCursosMatriculados(estudianteId: number): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.API_URL}/estudiante/${estudianteId}`).pipe(
      catchError(() => this.mockBackend.getCursosMatriculados(estudianteId))
    );
  }

  public matricularEstudiante(estudianteId: number, cursoId: number): Observable<Matricula> {
    return this.http.post<Matricula>(this.MATRICULAS_URL, { estudianteId, cursoId }).pipe(
      catchError(() => this.mockBackend.matricularEstudiante(estudianteId, cursoId))
    );
  }

  public desmatricularEstudiante(estudianteId: number, cursoId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.MATRICULAS_URL}/desmatricular`, { estudianteId, cursoId }).pipe(
      catchError(() => this.mockBackend.desmatricularEstudiante(estudianteId, cursoId))
    );
  }

  public getMatriculasPorCurso(cursoId: number): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${this.API_URL}/${cursoId}/matriculas`).pipe(
      catchError(() => this.mockBackend.getMatriculasPorCurso(cursoId))
    );
  }

  public guardarNotasCurso(cursoId: number, notasList: any[]): Observable<Matricula[]> {
    return this.http.post<Matricula[]>(`${this.API_URL}/${cursoId}/notas`, { notasList }).pipe(
      catchError(() => this.mockBackend.guardarNotasCurso(cursoId, notasList))
    );
  }

  public actualizarNotas(matriculaId: number, dto: any): Observable<Matricula> {
    return this.http.put<Matricula>(`${this.MATRICULAS_URL}/${matriculaId}/notas`, dto).pipe(
      catchError(() => this.mockBackend.actualizarNotas(matriculaId, dto))
    );
  }
}
