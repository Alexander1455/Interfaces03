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
  misCursos: Curso[] = [];
  usuarios: Usuario[] = [];
  isLoading = true;

  // KPIs Administrador
  totalCursos = 0;
  totalDocentes = 0;
  totalEstudiantes = 0;
  totalUsuarios = 0;

  // KPIs Docente
  misCursosAsignados = 0;
  totalAlumnosEnMisCursos = 0;
  totalCreditosDocente = 0;

  // KPIs Estudiante
  misCursosMatriculadosCount = 0;
  totalCreditosMatriculados = 0;
  cursosDisponiblesCount = 0;

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

    if (this.authService.isAdmin()) {
      this.cursoService.getCursos().subscribe({
        next: (data) => {
          this.cursos = data;
          this.totalCursos = data.length;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });

      this.usuarioService.getUsuarios().subscribe({
        next: (users) => {
          this.usuarios = users;
          this.totalUsuarios = users.length;
          this.totalDocentes = users.filter(u => u.rol === 'PROFESOR').length;
          this.totalEstudiantes = users.filter(u => u.rol === 'ESTUDIANTE').length;
        }
      });
    } else if (this.authService.isProfesor()) {
      this.cursoService.getCursos().subscribe({
        next: (data) => {
          this.cursos = data;
          const currentId = this.usuarioActual?.id;
          this.misCursos = data.filter(c => c.docenteId === currentId);
          this.misCursosAsignados = this.misCursos.length;
          this.totalCreditosDocente = this.misCursos.reduce((acc, curr) => acc + curr.creditos, 0);
          this.totalAlumnosEnMisCursos = this.misCursos.reduce((acc, curr) => acc + Math.max(0, curr.cuposTotales - curr.cuposDisponibles), 0);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    } else if (this.authService.isEstudiante() && this.usuarioActual) {
      this.cursoService.getCursosMatriculados(this.usuarioActual.id).subscribe({
        next: (matriculados) => {
          this.misCursos = matriculados;
          this.misCursosMatriculadosCount = matriculados.length;
          this.totalCreditosMatriculados = matriculados.reduce((acc, curr) => acc + curr.creditos, 0);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });

      this.cursoService.getCursos().subscribe({
        next: (allCourses) => {
          this.cursos = allCourses;
          this.cursosDisponiblesCount = allCourses.filter(c => c.estado).length;
        }
      });
    }
  }
}

