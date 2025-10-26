import { ApplicationRef, inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

/**
 * Service Worker Update Service
 *
 * Handles service worker updates and prompts users to reload
 * when a new version is available.
 */
@Injectable({
  providedIn: 'root',
})
export class SwUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);

  /**
   * Initialize service worker update checks
   */
  init(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('Service Worker is not enabled');
      return;
    }

    // Check for updates when app is stable
    this.checkForUpdates();

    // Listen for version updates
    this.listenForUpdates();

    // Handle unrecoverable state
    this.handleUnrecoverableState();
  }

  /**
   * Check for updates periodically
   */
  private checkForUpdates(): void {
    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable));
    const everySixHours$ = interval(6 * 60 * 60 * 1000); // Check every 6 hours
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  /**
   * Listen for version updates and prompt user
   */
  private listenForUpdates(): void {
    this.swUpdate.versionUpdates.subscribe((event) => {
      switch (event.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${event.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${event.currentVersion.hash}`);
          console.log(`New app version ready for use: ${event.latestVersion.hash}`);
          this.promptUserToUpdate();
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.error(`Failed to install app version '${event.version.hash}': ${event.error}`);
          break;
      }
    });
  }

  /**
   * Handle unrecoverable state (corrupted service worker)
   */
  private handleUnrecoverableState(): void {
    this.swUpdate.unrecoverable.subscribe((event) => {
      console.error(
        'An unrecoverable error occurred:',
        event.reason,
        '\nReloading the page to recover.'
      );
      window.location.reload();
    });
  }

  /**
   * Prompt user to reload the app with the new version
   */
  private promptUserToUpdate(): void {
    const message =
      'A new version of F1 Standings is available! Reload the page to get the latest features and improvements.';

    if (confirm(message)) {
      this.activateUpdate();
    }
  }

  /**
   * Activate the update and reload the page
   */
  private async activateUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch (err) {
      console.error('Failed to activate update:', err);
    }
  }

  /**
   * Manually check for updates (can be called from UI)
   */
  async checkForUpdateManually(): Promise<boolean> {
    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Failed to check for updates:', err);
      return false;
    }
  }
}
