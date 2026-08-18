import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appEstado',
  standalone: false
})
export class EstadoPipe implements PipeTransform {
  transform(value: boolean | string | number | null | undefined, type: 'text' | 'badge' = 'text'): string {
    const isActivo = value === true || value === 'true' || value === 1 || value === '1' || value === 'ACTIVO';

    if (type === 'badge') {
      return isActivo ? 'badge-success' : 'badge-danger';
    }

    return isActivo ? 'Activo' : 'Inactivo';
  }
}
