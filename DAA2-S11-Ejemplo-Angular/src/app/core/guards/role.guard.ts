import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const expectedRoles: UserRole[] = route.data['roles'] || route.data['expectedRoles'] || [];

    if (expectedRoles.length === 0 || this.authService.hasRole(expectedRoles)) {
      return true;
    }

    console.warn(`RoleGuard: Acceso denegado a ${state.url}. Se requiere uno de los roles: [${expectedRoles.join(', ')}].`);
    return this.router.createUrlTree(['/no-autorizado']);
  }
}
