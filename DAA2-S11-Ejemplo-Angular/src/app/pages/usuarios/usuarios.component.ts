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
  searchTerm = '';

  // Modal State
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
