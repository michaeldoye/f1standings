import { Injectable, signal } from '@angular/core';

/**
 * Filter Service
 *
 * Shared service for managing the driver filter state across components
 */
@Injectable({
  providedIn: 'root',
})
export class FilterService {
  readonly filterValue = signal('');

  setFilter(value: string): void {
    this.filterValue.set(value.trim().toLowerCase());
  }

  clearFilter(): void {
    this.filterValue.set('');
  }
}
