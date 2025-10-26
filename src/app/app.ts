import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { SwUpdateService } from './core/services/sw-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarRow, MatToolbar, MatSlideToggleModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly swUpdate = inject(SwUpdateService);
  protected readonly title = signal('f1standings');
  protected readonly isDarkMode = signal(false);

  constructor() {
    // Initialize service worker updates
    this.swUpdate.init();

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
}
