import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { distinctUntilChanged } from 'rxjs';
import { FilterService } from './core/services/filter.service';
import { SwUpdateService } from './core/services/sw-update.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarRow,
    MatToolbar,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly swUpdate = inject(SwUpdateService);
  private readonly filterService = inject(FilterService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly title = signal('f1standings');
  protected readonly isDarkMode = signal(false);
  protected readonly filterVisible = signal(false);
  protected readonly driverFilterControl = new FormControl('', { nonNullable: true });

  constructor() {
    // Initialize service worker updates
    this.swUpdate.init();

    // Sync filter control with filter service
    this.driverFilterControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.filterService.setFilter(value));

    // Initialize dark mode from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Apply theme changes
    effect(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        this.document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        this.document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  protected toggleDarkMode(): void {
    this.isDarkMode.update((mode) => !mode);
  }

  protected clearFilter(): void {
    this.driverFilterControl.setValue('');
    this.filterService.clearFilter();
  }
}
