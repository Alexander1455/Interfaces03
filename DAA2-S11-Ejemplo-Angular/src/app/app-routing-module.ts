import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CursosComponent } from './pages/cursos/cursos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LoginGuard } from './core/guards/login.guard';

const routes: Routes = [
  // Ruta pública: Login (protegida por LoginGuard para evitar reingreso si ya está autenticado)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },

  // Rutas privadas: Protegidas por AuthGuard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cursos',
    component: CursosComponent,
    canActivate: [AuthGuard]
  },

  // Ruta restringida exclusivamente para Administradores con RoleGuard
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['ADMIN'],
      expectedRoles: ['ADMIN']
    }
  },

  // Ruta de acceso denegado (403)
  {
    path: 'no-autorizado',
    component: ForbiddenComponent,
    canActivate: [AuthGuard]
  },

  // Ruta 404
  {
    path: '404',
    component: NotFoundComponent
  },

  // Redirecciones automáticas
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
