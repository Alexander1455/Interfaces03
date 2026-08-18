import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario, UsuarioCreateDto, UsuarioUpdateDto } from '../models/usuario.model';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly API_URL = 'http://localhost:9090/api/usuarios';

  constructor(
    private http: HttpClient,
    private mockBackend: MockBackendService
  ) {}

  public getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL).pipe(
      catchError((error) => {
        console.warn('⚠️ [UsuarioService] Fallback a mock:', error);
        return this.mockBackend.getUsuarios();
      })
    );
  }

  public getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}`).pipe(
      catchError(() => this.mockBackend.getUsuarioById(id))
    );
  }

  public crearUsuario(dto: UsuarioCreateDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, dto).pipe(
      catchError(() => this.mockBackend.createUsuario(dto))
    );
  }

  public actualizarUsuario(dto: UsuarioUpdateDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${dto.id}`, dto).pipe(
      catchError(() => this.mockBackend.updateUsuario(dto))
    );
  }

  public eliminarUsuario(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API_URL}/${id}`).pipe(
      catchError(() => this.mockBackend.deleteUsuario(id))
    );
  }
}
