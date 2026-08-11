import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, UserRole, UsuarioSesion } from '../models/auth.model';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'idat_auth_token';
  private readonly USER_KEY = 'idat_auth_user';

  private currentUserSubject: BehaviorSubject<UsuarioSesion | null>;
  public currentUser$: Observable<UsuarioSesion | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private mockBackend: MockBackendService
  ) {
    const savedUser = localStorage.getItem(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<UsuarioSesion | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get usuarioActual(): UsuarioSesion | null {
    return this.currentUserSubject.value;
  }

  public login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.mockBackend.login(credentials).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.usuario));
    this.currentUserSubject.next(authResult.usuario);
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Validar expiración si el payload está codificado en base64
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          this.logout();
          return false;
        }
      }
    } catch (e) {
      console.warn('Error validando token JWT', e);
    }
    return true;
  }

  public getRol(): UserRole | null {
    const user = this.usuarioActual;
    return user ? user.rol : null;
  }

  public hasRole(allowedRoles: UserRole[]): boolean {
    const rol = this.getRol();
    return rol !== null && allowedRoles.includes(rol);
  }

  public isAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  public isProfesor(): boolean {
    return this.getRol() === 'PROFESOR';
  }

  public isEstudiante(): boolean {
    return this.getRol() === 'ESTUDIANTE';
  }
}
