import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursoService } from '../../core/services/curso.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso, CursoCreateDto, CursoUpdateDto, Matricula, ActualizarNotaItemDto } from '../../core/models/curso.model';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css'],
  standalone: false
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  docentes: Usuario[] = [];
  matriculasIds: number[] = [];
  isLoading = true;

  // Filtros de búsqueda
  searchTerm = '';
  selectedCategoria = '';
  selectedEstado = '';
  selectedDocente = '';
  
  // Estado Modal Curso
  isModalOpen = false;
  isEditing = false;
  selectedCursoId: number | null = null;

  // Estado Modal de Aviso para Docentes
  isAvisoPermisoModalOpen = false;
  cursoAvisoDocente: Curso | null = null;

  // Estado Modal Gestión de Calificaciones (Docente)
  isModalNotasOpen = false;
  cursoNotasSeleccionado: Curso | null = null;
  matriculasCurso: Matricula[] = [];
  isLoadingNotas = false;
  isSavingNotas = false;

  // Estado Modal Boleta de Notas (Estudiante)
  isModalBoletaOpen = false;
  boletaEstudiante: Matricula | null = null;
  cursoBoleta: Curso | null = null;
  
  cursoForm!: FormGroup;
  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' = 'success';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;
  tamaniosPagina = [5, 10, 15, 20];

  categoriasDisponibles = [
    'Desarrollo Web',
    'Backend & Cloud',
    'Bases de Datos',
    'Ciberseguridad',
    'Inteligencia Artificial',
    'Móviles & Multiplataforma'
  ];

  fechasInicioDisponibles = [
    '16 de Marzo de 2026 (Ciclo 2026-I)',
    '01 de Abril de 2026 (Ciclo 2026-I)',
    '15 de Abril de 2026 (Inicio Quincenal)',
    '04 de Mayo de 2026 (Ciclo Modular)',
    '01 de Junio de 2026 (Ciclo Intensivo)',
    '17 de Agosto de 2026 (Ciclo 2026-II)',
    '01 de Septiembre de 2026 (Ciclo 2026-II)',
    '14 de Septiembre de 2026 (Inicio Quincenal)',
    '05 de Octubre de 2026 (Ciclo Modular II)',
    '02 de Noviembre de 2026 (Ciclo Intensivo II)',
    '04 de Enero de 2027 (Ciclo Verano 2027)',
    '18 de Enero de 2027 (Ciclo Verano Intensivo)'
  ];

  fechasFinDisponibles = [
    '17 de Julio de 2026 (Fin Semestre)',
    '31 de Julio de 2026 (Fin Evaluaciones)',
    '18 de Diciembre de 2026 (Fin Semestre)',
    '29 de Diciembre de 2026 (Fin Evaluaciones)',
    '26 de Febrero de 2027 (Fin Ciclo Verano)',
    '12 de Marzo de 2027 (Fin Verano Intensivo)'
  ];

  horariosDisponibles = [
    'Lun - Mie 08:00 - 10:30 (Mañana)',
    'Lun - Mie 10:45 - 13:15 (Mañana)',
    'Lun - Mie 14:00 - 16:30 (Tarde)',
    'Lun - Mie 16:45 - 19:15 (Tarde)',
    'Lun - Mie 19:00 - 21:30 (Noche)',
    'Lun - Mie 19:30 - 22:00 (Noche)',
    'Mar - Jue 08:00 - 10:30 (Mañana)',
    'Mar - Jue 10:45 - 13:15 (Mañana)',
    'Mar - Jue 14:00 - 16:30 (Tarde)',
    'Mar - Jue 18:30 - 21:00 (Noche)',
    'Mar - Jue 19:00 - 21:30 (Noche)',
    'Vie 14:00 - 18:00 (Tarde Intensivo)',
    'Vie 19:00 - 22:00 (Noche Intensivo)',
    'Sab 08:00 - 13:00 (Sábados Mañana)',
    'Sab 14:00 - 19:00 (Sábados Tarde)',
    'Dom 08:30 - 13:30 (Domingos Mañana)'
  ];

  constructor(
    private cursoService: CursoService,
    private usuarioService: UsuarioService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
  }

  private initForm(): void {
    const defaultDocenteId = this.authService.isProfesor() 
      ? this.authService.usuarioActual?.id 
      : '';

    this.cursoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: [this.categoriasDisponibles[0], Validators.required],
      creditos: [4, [Validators.required, Validators.min(1), Validators.max(10)]],
      docenteId: [defaultDocenteId, Validators.required],
      cuposTotales: [30, [Validators.required, Validators.min(5), Validators.max(100)]],
      horario: [this.horariosDisponibles[4], Validators.required],
      fechaInicio: [this.fechasInicioDisponibles[0], Validators.required],
      fechaFin: [this.fechasFinDisponibles[0], Validators.required],
      estado: [true, Validators.required]
    });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: () => {
        this.mostrarToast('Error al cargar la lista de cursos', 'danger');
        this.isLoading = false;
      }
    });

    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.docentes = usuarios.filter(u => u.rol === 'PROFESOR' && u.estado);
      }
    });

    if (this.authService.isEstudiante() && this.authService.usuarioActual) {
      this.cursoService.getMatriculas(this.authService.usuarioActual.id).subscribe({
        next: (matriculas) => {
          this.matriculasIds = matriculas.map(m => m.cursoId);
        }
      });
    }
  }

  get cursosFiltrados(): Curso[] {
    return this.cursos.filter(c => {
      // 1. Filtro por texto de búsqueda
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase().trim();
        const matchesText =
          c.nombre.toLowerCase().includes(term) ||
          c.codigo.toLowerCase().includes(term) ||
          c.categoria.toLowerCase().includes(term) ||
          c.docenteNombre.toLowerCase().includes(term) ||
          c.descripcion.toLowerCase().includes(term);
        if (!matchesText) return false;
      }

      // 2. Filtro por categoría
      if (this.selectedCategoria && c.categoria !== this.selectedCategoria) {
        return false;
      }

      // 3. Filtro por estado
      if (this.selectedEstado !== '') {
        const estadoBool = this.selectedEstado === 'true';
        if (c.estado !== estadoBool) return false;
      }

      // 4. Filtro por docente
      if (this.selectedDocente !== '') {
        if (c.docenteId !== Number(this.selectedDocente)) return false;
      }

      // 5. Restricción estricta para maestros: El maestro SOLO puede ver los cursos que tiene a cargo
      if (this.authService.isProfesor()) {
        if (c.docenteId !== this.authService.usuarioActual?.id) return false;
      }

      return true;
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.cursosFiltrados.length / this.itemsPorPagina));
  }

  get cursosPaginados(): Curso[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.cursosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get indiceInicio(): number {
    if (this.cursosFiltrados.length === 0) return 0;
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get indiceFin(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.cursosFiltrados.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  onFilterChange(): void {
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedCategoria = '';
    this.selectedEstado = '';
    this.selectedDocente = '';
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    if (!this.authService.isAdmin()) {
      this.mostrarToast('Acción denegada: Solo los administradores tienen permiso para registrar nuevos cursos.', 'warning');
      return;
    }

    this.isEditing = false;
    this.selectedCursoId = null;

    const currentDocenteId = this.docentes.length > 0 ? this.docentes[0].id : '';

    this.cursoForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: this.categoriasDisponibles[0],
      creditos: 4,
      docenteId: currentDocenteId,
      cuposTotales: 30,
      horario: this.horariosDisponibles[4],
      fechaInicio: this.fechasInicioDisponibles[0],
      fechaFin: this.fechasFinDisponibles[0],
      estado: true
    });
    this.isModalOpen = true;
  }

  abrirModalEditar(curso: Curso): void {
    // Si el usuario autenticado es un docente (PROFESOR), mostrar aviso modal formal de solicitud de permiso
    if (this.authService.isProfesor()) {
      this.cursoAvisoDocente = curso;
      this.isAvisoPermisoModalOpen = true;
      this.mostrarToast('Aviso: Debe solicitar autorización a la administración para modificar cursos.', 'warning');
      return;
    }

    if (!this.authService.isAdmin()) {
      this.mostrarToast('Acción denegada: Solo los administradores pueden modificar cursos.', 'warning');
      return;
    }

    this.isEditing = true;
    this.selectedCursoId = curso.id;
    this.cursoForm.patchValue({
      codigo: curso.codigo,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      categoria: curso.categoria,
      creditos: curso.creditos,
      docenteId: curso.docenteId,
      cuposTotales: curso.cuposTotales,
      horario: curso.horario || this.horariosDisponibles[0],
      fechaInicio: curso.fechaInicio || this.fechasInicioDisponibles[0],
      fechaFin: curso.fechaFin || this.fechasFinDisponibles[0],
      estado: curso.estado
    });
    this.isModalOpen = true;
  }

  cerrarAvisoPermiso(): void {
    this.isAvisoPermisoModalOpen = false;
    this.cursoAvisoDocente = null;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.cursoForm.reset();
  }

  guardarCurso(): void {
    if (!this.authService.isAdmin()) {
      this.mostrarToast('Acción no permitida: Debe solicitar permiso a la administración para guardar cambios.', 'danger');
      return;
    }

    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }

    const formValues = this.cursoForm.value;

    if (this.isEditing && this.selectedCursoId) {
      const updateDto: CursoUpdateDto = {
        id: this.selectedCursoId,
        ...formValues
      };

      this.cursoService.actualizarCurso(updateDto).subscribe({
        next: () => {
          this.mostrarToast('Curso actualizado exitosamente por la administración', 'success');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al actualizar el curso', 'danger');
        }
      });
    } else {
      const createDto: CursoCreateDto = {
        ...formValues
      };

      this.cursoService.crearCurso(createDto).subscribe({
        next: () => {
          this.mostrarToast('Nuevo curso registrado correctamente en el catálogo', 'success');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al registrar el curso', 'danger');
        }
      });
    }
  }

  eliminarCurso(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el curso "${nombre}"? Esta acción no se puede deshacer.`)) {
      this.cursoService.eliminarCurso(id).subscribe({
        next: () => {
          this.mostrarToast('Curso eliminado correctamente', 'warning');
          this.cargarDatos();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al eliminar curso', 'danger');
        }
      });
    }
  }

  estaMatriculado(cursoId: number): boolean {
    return this.matriculasIds.includes(cursoId);
  }

  matricularme(curso: Curso): void {
    if (!this.authService.usuarioActual) return;
    
    this.cursoService.matricularEstudiante(this.authService.usuarioActual.id, curso.id).subscribe({
      next: () => {
        this.mostrarToast(`¡Te has matriculado exitosamente en "${curso.nombre}"!`, 'success');
        this.cargarDatos();
      },
      error: (err) => {
        this.mostrarToast(err.message || 'Error al procesar la matrícula', 'danger');
      }
    });
  }

  retirarMatricula(curso: Curso): void {
    if (!this.authService.usuarioActual) return;

    if (confirm(`¿Está seguro de retirarse del curso "${curso.nombre}"? Liberarás un cupo para otros alumnos.`)) {
      this.cursoService.desmatricularEstudiante(this.authService.usuarioActual.id, curso.id).subscribe({
        next: () => {
          this.mostrarToast(`Te has retirado de la asignatura "${curso.nombre}".`, 'warning');
          this.cargarDatos();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al retirar matrícula', 'danger');
        }
      });
    }
  }

  // --- MÉTODOS DE CALIFICACIONES (DOCENTE) ---
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
        this.mostrarToast('Error al guardar las calificaciones del curso', 'danger');
        this.isSavingNotas = false;
      }
    });
  }

  // --- MÉTODOS DE BOLETA DE NOTAS (ESTUDIANTE) ---
  verMisNotas(curso: Curso): void {
    if (!this.authService.usuarioActual) return;
    this.cursoBoleta = curso;
    this.cursoService.getMatriculas(this.authService.usuarioActual.id).subscribe({
      next: (matriculas) => {
        const mat = matriculas.find(m => m.cursoId === curso.id);
        if (mat) {
          this.boletaEstudiante = mat;
          this.isModalBoletaOpen = true;
        } else {
          this.mostrarToast('No se encontró el registro de notas para este curso', 'warning');
        }
      },
      error: () => {
        this.mostrarToast('Error al consultar las calificaciones', 'danger');
      }
    });
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

