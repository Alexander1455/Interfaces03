import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, UserRole, UsuarioSesion } from '../models/auth.model';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:9090/api/auth';
  private readonly TOKEN_KEY = 'idat_auth_token';
  private readonly USER_KEY = 'idat_auth_user';

  private currentUserSubject: BehaviorSubject<UsuarioSesion | null>;
  public currentUser$: Observable<UsuarioSesion | null>;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private mockBackend: MockBackendService
  ) {
    let savedUser = null;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(this.USER_KEY);
        savedUser = stored ? JSON.parse(stored) : null;
      } catch (e) {
        console.warn('Error parsing user session from localStorage', e);
      }
    }
    this.currentUserSubject = new BehaviorSubject<UsuarioSesion | null>(savedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get usuarioActual(): UsuarioSesion | null {
    return this.currentUserSubject.value;
  }

  public login(credentials: LoginRequest): Observable<AuthResponse> {
    // Intenta autenticación contra la API REST real en Node/MySQL y recurre al Mock de respaldo si está offline
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response);
      }),
      catchError((httpError) => {
        console.warn('⚠️ [AuthService] API REST no disponible o error, usando fallback Mock:', httpError);
        return this.mockBackend.login(credentials).pipe(
          tap((response: AuthResponse) => {
            this.setSession(response);
          })
        );
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, authResult.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.usuario));
    }
    this.currentUserSubject.next(authResult.usuario);
  }

  public logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
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
