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
  isLoading = true;
  searchTerm = '';
  
  // Modal state
  isModalOpen = false;
  isEditing = false;
  selectedCursoId: number | null = null;
  
  cursoForm!: FormGroup;
  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' = 'success';

  categoriasDisponibles = [
    'Desarrollo Web',
    'Backend & Cloud',
    'Bases de Datos',
    'Ciberseguridad',
    'Inteligencia Artificial',
    'Móviles & Multiplataforma'
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
    this.cursoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['', Validators.required],
      creditos: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      docenteId: ['', Validators.required],
      cuposTotales: [30, [Validators.required, Validators.min(5), Validators.max(100)]],
      horario: ['', Validators.required],
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
      error: (err) => {
        this.mostrarToast('Error al cargar la lista de cursos', 'danger');
        this.isLoading = false;
      }
    });

    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.docentes = usuarios.filter(u => u.rol === 'PROFESOR' && u.estado);
        if (this.docentes.length > 0 && !this.cursoForm.get('docenteId')?.value) {
          this.cursoForm.patchValue({ docenteId: this.docentes[0].id });
        }
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.selectedCursoId = null;
    this.cursoForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: this.categoriasDisponibles[0],
      creditos: 4,
      docenteId: this.docentes.length > 0 ? this.docentes[0].id : '',
      cuposTotales: 30,
      horario: 'Lun - Mie 19:00 - 21:30',
      estado: true
    });
    this.isModalOpen = true;
  }

  abrirModalEditar(curso: Curso): void {
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
      horario: curso.horario,
      estado: curso.estado
    });
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.cursoForm.reset();
  }

  guardarCurso(): void {
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
          this.mostrarToast('Curso actualizado exitosamente con token JWT', 'success');
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
          this.mostrarToast('Nuevo curso registrado en el sistema', 'success');
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

  matricularme(curso: Curso): void {
    this.mostrarToast(`¡Matrícula exitosa en "${curso.nombre}"!`, 'success');
  }

  mostrarToast(msg: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }
}
