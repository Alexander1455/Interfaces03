import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CursoService } from '../../core/services/curso.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Curso, Matricula, ActualizarNotaItemDto } from '../../core/models/curso.model';
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
  matriculasEstudiante: Matricula[] = [];
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
  promedioPonderadoGeneral: number | null = null;

  // Modal Notas Docente
  isModalNotasOpen = false;
  cursoNotasSeleccionado: Curso | null = null;
  matriculasCurso: Matricula[] = [];
  isLoadingNotas = false;
  isSavingNotas = false;

  // Modal Boleta Estudiante
  isModalBoletaOpen = false;
  boletaEstudiante: Matricula | null = null;
  cursoBoleta: Curso | null = null;

  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' = 'success';

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
          this.totalCreditosDocente = this.misCursos.reduce((acc, curr) => acc + (Number(curr.creditos) || 4), 0);
          this.totalAlumnosEnMisCursos = this.misCursos.reduce((acc, curr) => acc + Math.max(0, curr.cuposTotales - curr.cuposDisponibles), 0);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    } else if (this.authService.isEstudiante() && this.usuarioActual) {
      const studentId = this.usuarioActual.id;

      // 1. Obtener cursos matriculados para el estudiante
      this.cursoService.getCursosMatriculados(studentId).subscribe({
        next: (matriculados) => {
          this.misCursos = matriculados;
          this.misCursosMatriculadosCount = matriculados.length;
          this.totalCreditosMatriculados = matriculados.reduce((acc, curr) => acc + (Number(curr.creditos) || 4), 0);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });

      // 2. Obtener calificaciones y ponderaciones del estudiante
      this.cursoService.getMatriculas(studentId).subscribe({
        next: (matriculas) => {
          this.matriculasEstudiante = matriculas;
          const promedios = matriculas
            .map(m => m.promedioFinal)
            .filter(p => p !== null && p !== undefined && !isNaN(Number(p))) as number[];
          if (promedios.length > 0) {
            this.promedioPonderadoGeneral = Number((promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1));
          } else {
            this.promedioPonderadoGeneral = null;
          }
        }
      });

      // 3. Obtener catálogo total de cursos para métrica de disponibles
      this.cursoService.getCursos().subscribe({
        next: (allCourses) => {
          this.cursos = allCourses;
          this.cursosDisponiblesCount = allCourses.filter(c => c.estado).length;
        }
      });
    }
  }

  getMatriculaDeCurso(cursoId: number): Matricula | undefined {
    return this.matriculasEstudiante.find(m => m.cursoId === cursoId);
  }

  // --- DOCENTE: CALIFICACIONES ---
  abrirModalNotas(curso: Curso): void {
    this.cursoNotasSeleccionado = curso;
    this.isLoadingNotas = true;
    this.isModalNotasOpen = true;

    this.cursoService.getMatriculasPorCurso(curso.id).subscribe({
      next: (matriculas) => {
        this.matriculasCurso = matriculas.map(m => ({ ...m }));
        this.isLoadingNotas = false;
      },
      error: () => {
        this.mostrarToast('Error al cargar la nómina de estudiantes', 'danger');
        this.isLoadingNotas = false;
      }
    });
  }

  cerrarModalNotas(): void {
    this.isModalNotasOpen = false;
    this.cursoNotasSeleccionado = null;
    this.matriculasCurso = [];
  }

  recalcularNotaFila(m: Matricula): void {
    const clamp = (val: any) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = Number(val);
      if (isNaN(num)) return null;
      return Math.max(0, Math.min(20, num));
    };

    m.notaEC1 = clamp(m.notaEC1);
    m.notaEC2 = clamp(m.notaEC2);
    m.notaEC3 = clamp(m.notaEC3);
    m.notaEF = clamp(m.notaEF);

    if (m.notaEC1 != null && m.notaEC2 != null && m.notaEC3 != null && m.notaEF != null) {
      const prom = Number(((Number(m.notaEC1) * 0.2) + (Number(m.notaEC2) * 0.2) + (Number(m.notaEC3) * 0.2) + (Number(m.notaEF) * 0.4)).toFixed(1));
      m.promedioFinal = prom;
      m.estadoAcademico = prom >= 12.5 ? 'APROBADO' : 'DESAPROBADO';
    } else {
      const validNotas = [m.notaEC1, m.notaEC2, m.notaEC3, m.notaEF].filter(n => n != null) as number[];
      if (validNotas.length > 0) {
        m.promedioFinal = Number((validNotas.reduce((a, b) => a + Number(b), 0) / validNotas.length).toFixed(1));
        m.estadoAcademico = 'EN_CURSO';
      } else {
        m.promedioFinal = null;
        m.estadoAcademico = 'EN_CURSO';
      }
    }
  }

  guardarCalificaciones(): void {
    if (!this.cursoNotasSeleccionado) return;

    this.isSavingNotas = true;
    const dtos: ActualizarNotaItemDto[] = this.matriculasCurso.map(m => ({
      matriculaId: m.id,
      notaEC1: m.notaEC1,
      notaEC2: m.notaEC2,
      notaEC3: m.notaEC3,
      notaEF: m.notaEF,
      observaciones: m.observaciones || ''
    }));

    this.cursoService.guardarNotasCurso(this.cursoNotasSeleccionado.id, dtos).subscribe({
      next: (updated) => {
        this.matriculasCurso = updated;
        this.isSavingNotas = false;
        this.mostrarToast(`¡Calificaciones guardadas exitosamente para ${this.cursoNotasSeleccionado?.nombre}!`, 'success');
        this.cerrarModalNotas();
        this.cargarDatos();
      },
      error: () => {
        this.mostrarToast('Error al guardar las calificaciones', 'danger');
        this.isSavingNotas = false;
      }
    });
  }

  // --- ESTUDIANTE: BOLETA ---
  verMisNotas(curso: Curso): void {
    if (!this.usuarioActual) return;
    this.cursoBoleta = curso;
    const mat = this.matriculasEstudiante.find(m => m.cursoId === curso.id);
    if (mat) {
      this.boletaEstudiante = mat;
      this.isModalBoletaOpen = true;
    } else {
      this.cursoService.getMatriculas(this.usuarioActual.id).subscribe({
        next: (matriculas) => {
          this.matriculasEstudiante = matriculas;
          const found = matriculas.find(m => m.cursoId === curso.id);
          if (found) {
            this.boletaEstudiante = found;
            this.isModalBoletaOpen = true;
          } else {
            this.mostrarToast('No se encontró el registro de notas para este curso', 'warning');
          }
        }
      });
    }
  }

  cerrarModalBoleta(): void {
    this.isModalBoletaOpen = false;
    this.boletaEstudiante = null;
    this.cursoBoleta = null;
  }

  isAprobado(nota: number | null | undefined): boolean {
    return nota !== null && nota !== undefined && Number(nota) >= 12.5;
  }

  isDesaprobado(nota: number | null | undefined): boolean {
    return nota !== null && nota !== undefined && Number(nota) < 12.5;
  }

  mostrarToast(msg: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }
}
