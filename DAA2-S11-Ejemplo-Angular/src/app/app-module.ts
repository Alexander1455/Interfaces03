import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Pages
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CursosComponent } from './pages/cursos/cursos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

// Shared Directives & Pipes
import { HasRoleDirective } from './shared/directives/has-role.directive';
import { EstadoPipe } from './shared/pipes/estado.pipe';
import { RolPipe } from './shared/pipes/rol.pipe';
import { FiltroBusquedaPipe } from './shared/pipes/filtro-busqueda.pipe';

// Core Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    App,
    // Pages
    LoginComponent,
    DashboardComponent,
    CursosComponent,
    UsuariosComponent,
    ForbiddenComponent,
    NotFoundComponent,
    // Shared Layout
    NavbarComponent,
    SidebarComponent,
    // Directives & Pipes
    HasRoleDirective,
    EstadoPipe,
    RolPipe,
    FiltroBusquedaPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
