import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioSesion } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: false
})
export class NavbarComponent implements OnInit {
  usuario$!: Observable<UsuarioSesion | null>;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.usuario$ = this.authService.currentUser$;
  }

  logout(): void {
    if (confirm('¿Está seguro que desea cerrar su sesión actual?')) {
      this.authService.logout();
    }
  }
}
