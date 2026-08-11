import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
    return this.mockBackend.getUsuarios().pipe(
      catchError(this.handleError)
    );
  }

  public getUsuarioById(id: number): Observable<Usuario> {
    return this.mockBackend.getUsuarioById(id).pipe(
      catchError(this.handleError)
    );
  }

  public crearUsuario(dto: UsuarioCreateDto): Observable<Usuario> {
    return this.mockBackend.createUsuario(dto).pipe(
      catchError(this.handleError)
    );
  }

  public actualizarUsuario(dto: UsuarioUpdateDto): Observable<Usuario> {
    return this.mockBackend.updateUsuario(dto).pipe(
      catchError(this.handleError)
    );
  }

  public eliminarUsuario(id: number): Observable<boolean> {
    return this.mockBackend.deleteUsuario(id).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | any) {
    let errorMessage = 'Ocurrió un error inesperado en el servidor.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error en UsuarioService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
