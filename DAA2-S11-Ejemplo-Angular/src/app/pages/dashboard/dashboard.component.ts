import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CursoService } from '../../core/services/curso.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Curso } from '../../core/models/curso.model';
import { Usuario } from '../../core/models/usuario.model';
import { UsuarioSesion } from '../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  usuarioActual: UsuarioSesion | null = null;
  cursos: Curso[] = [];
  usuarios: Usuario[] = [];
  isLoading = true;

  totalCursos = 0;
  totalUsuarios = 0;
  totalCreditos = 0;

  constructor(
    public authService: AuthService,
    private cursoService: CursoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.usuarioActual;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.totalCursos = data.filter(c => c.estado).length;
        this.totalCreditos = data.reduce((acc, curr) => acc + curr.creditos, 0);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    if (this.authService.isAdmin()) {
      this.usuarioService.getUsuarios().subscribe({
        next: (data) => {
          this.usuarios = data;
          this.totalUsuarios = data.length;
        }
      });
    }
  }
}
