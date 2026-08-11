import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '../../core/models/auth.model';

@Pipe({
  name: 'appRol',
  standalone: false
})
export class RolPipe implements PipeTransform {
  transform(role: UserRole | string | undefined | null): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'PROFESOR':
        return 'Docente';
      case 'ESTUDIANTE':
        return 'Estudiante';
      default:
        return role || 'Usuario';
    }
  }
}
