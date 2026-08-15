import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursoService } from '../../core/services/curso.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso, CursoCreateDto, CursoUpdateDto } from '../../core/models/curso.model';
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
  soloMisCursos = false;
  
  // Estado Modal
  isModalOpen = false;
  isEditing = false;
  selectedCursoId: number | null = null;

  // Estado Modal de Aviso para Docentes
  isAvisoPermisoModalOpen = false;
  cursoAvisoDocente: Curso | null = null;
  
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
    '17 de Marzo de 2025 (Ciclo 2025-I)',
    '01 de Abril de 2025 (Ciclo 2025-I)',
    '15 de Abril de 2025 (Inicio Quincenal)',
    '05 de Mayo de 2025 (Ciclo Modular)',
    '02 de Junio de 2025 (Ciclo Intensivo)',
    '18 de Agosto de 2025 (Ciclo 2025-II)',
    '01 de Septiembre de 2025 (Ciclo 2025-II)',
    '15 de Septiembre de 2025 (Inicio Quincenal)',
    '06 de Octubre de 2025 (Ciclo Modular II)',
    '03 de Noviembre de 2025 (Ciclo Intensivo II)',
    '05 de Enero de 2026 (Ciclo Verano 2026)',
    '19 de Enero de 2026 (Ciclo Verano Intensivo)'
  ];

  fechasFinDisponibles = [
    '18 de Julio de 2025 (Fin Semestre)',
    '01 de Agosto de 2025 (Fin Evaluaciones)',
    '19 de Diciembre de 2025 (Fin Semestre)',
    '30 de Diciembre de 2025 (Fin Evaluaciones)',
    '27 de Febrero de 2026 (Fin Ciclo Verano)',
    '13 de Marzo de 2026 (Fin Verano Intensivo)'
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

      // 5. Filtro rápido "Solo mis asignaturas" para maestros
      if (this.soloMisCursos && this.authService.isProfesor()) {
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
    this.soloMisCursos = false;
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

  mostrarToast(msg: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }
}

