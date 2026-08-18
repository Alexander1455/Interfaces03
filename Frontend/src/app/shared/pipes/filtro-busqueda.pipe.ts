import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFiltroBusqueda',
  standalone: false
})
export class FiltroBusquedaPipe implements PipeTransform {
  transform<T extends Record<string, any>>(items: T[] | null | undefined, searchTerm: string, fields: (keyof T)[]): T[] {
    if (!items) return [];
    if (!searchTerm || searchTerm.trim() === '' || !fields || fields.length === 0) {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();

    return items.filter(item => {
      return fields.some(field => {
        const val = item[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }
}
