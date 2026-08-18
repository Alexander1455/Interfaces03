import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    let authReq = request;
    if (token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Interceptor: Sesión expirada o no autorizada (401). Redirigiendo a login...');
          this.authService.logout();
        } else if (error.status === 403) {
          console.warn('Interceptor: Acceso denegado (403). Redirigiendo a pantalla de permisos...');
          this.router.navigate(['/no-autorizado']);
        }
        return throwError(() => error);
      })
    );
  }
}
