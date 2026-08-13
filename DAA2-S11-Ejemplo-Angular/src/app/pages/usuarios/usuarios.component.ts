import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario, UsuarioCreateDto, UsuarioUpdateDto } from '../../core/models/usuario.model';
import { UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  standalone: false
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  isLoading = true;

  // Filtros
  searchTerm = '';
  selectedRol = '';
  selectedEstado = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;
  tamaniosPagina = [5, 10, 15, 20];

  // Estado Modal
  isModalOpen = false;
  isEditing = false;
  selectedUserId: number | null = null;

  usuarioForm!: FormGroup;
  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' = 'success';

  rolesDisponibles: UserRole[] = ['ADMIN', 'PROFESOR', 'ESTUDIANTE'];

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarUsuarios();
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      clave: ['123456'],
      rol: ['ESTUDIANTE' as UserRole, Validators.required],
      codigoInstitucional: ['', Validators.required],
      telefono: ['', [Validators.pattern(/^[0-9+ ]{9,15}$/)]],
      estado: [true, Validators.required]
    });
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: () => {
        this.mostrarToast('Error al cargar la lista de usuarios', 'danger');
        this.isLoading = false;
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      // 1. Filtro por texto
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase().trim();
        const matchesText =
          u.nombreCompleto.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.codigoInstitucional.toLowerCase().includes(term) ||
          (u.telefono && u.telefono.toLowerCase().includes(term));
        if (!matchesText) return false;
      }

      // 2. Filtro por Rol
      if (this.selectedRol && u.rol !== this.selectedRol) {
        return false;
      }

      // 3. Filtro por Estado
      if (this.selectedEstado !== '') {
        const estadoBool = this.selectedEstado === 'true';
        if (u.estado !== estadoBool) return false;
      }

      return true;
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina));
  }

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get indiceInicio(): number {
    if (this.usuariosFiltrados.length === 0) return 0;
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get indiceFin(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.usuariosFiltrados.length);
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
    this.selectedRol = '';
    this.selectedEstado = '';
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.selectedUserId = null;
    const nextCode = `USR-${(this.usuarios.length + 1).toString().padStart(4, '0')}`;
    this.usuarioForm.reset({
      nombreCompleto: '',
      email: '',
      clave: '123456',
      rol: 'ESTUDIANTE',
      codigoInstitucional: nextCode,
      telefono: '+51 987 000 111',
      estado: true
    });
    this.isModalOpen = true;
  }

  abrirModalEditar(user: Usuario): void {
    this.isEditing = true;
    this.selectedUserId = user.id;
    this.usuarioForm.patchValue({
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      rol: user.rol,
      codigoInstitucional: user.codigoInstitucional,
      telefono: user.telefono || '',
      estado: user.estado
    });
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.usuarioForm.reset();
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formValues = this.usuarioForm.value;

    if (this.isEditing && this.selectedUserId) {
      const updateDto: UsuarioUpdateDto = {
        id: this.selectedUserId,
        ...formValues
      };

      this.usuarioService.actualizarUsuario(updateDto).subscribe({
        next: () => {
          this.mostrarToast('Usuario actualizado con éxito', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al actualizar usuario', 'danger');
        }
      });
    } else {
      const createDto: UsuarioCreateDto = {
        ...formValues
      };

      this.usuarioService.crearUsuario(createDto).subscribe({
        next: () => {
          this.mostrarToast('Nuevo usuario creado exitosamente', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al crear usuario', 'danger');
        }
      });
    }
  }

  eliminarUsuario(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el usuario "${nombre}"?`)) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
          this.mostrarToast('Usuario eliminado del sistema', 'warning');
          this.cargarUsuarios();
        },
        error: (err) => {
          this.mostrarToast(err.message || 'Error al eliminar usuario', 'danger');
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

