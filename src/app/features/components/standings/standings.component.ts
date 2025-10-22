import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { DriverStanding } from '../../../core/models/jolpica.model';
import { JolpicaApiService } from '../../../core/services/jolpica-api.service';
import { OpenF1ApiService } from '../../../core/services/openf1-api.service';

@Component({
  selector: 'app-standings',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './standings.component.html',
  styleUrl: './standings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandingsComponent implements OnInit {
  protected readonly step = signal(0);
  private readonly jolpicaService = inject(JolpicaApiService);
  private readonly openF1Service = inject(OpenF1ApiService);

  protected readonly driverStandings = signal<DriverStanding[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly teamColors = signal<Map<string, string>>(new Map());

  // Map nationality to country code for flag emoji
  private readonly nationalityToCode: Record<string, string> = {
    Australian: 'AU',
    Austrian: 'AT',
    British: 'GB',
    Canadian: 'CA',
    Chinese: 'CN',
    Danish: 'DK',
    Dutch: 'NL',
    Finnish: 'FI',
    French: 'FR',
    German: 'DE',
    Italian: 'IT',
    Japanese: 'JP',
    Mexican: 'MX',
    Monegasque: 'MC',
    'New Zealander': 'NZ',
    Polish: 'PL',
    Spanish: 'ES',
    Swedish: 'SE',
    Swiss: 'CH',
    Thai: 'TH',
    American: 'US',
  };

  ngOnInit(): void {
    this.loadStandings();
  }

  private loadStandings(): void {
    this.loading.set(true);

    // Fetch both standings and team colors in parallel
    forkJoin({
      standings: this.jolpicaService.getCurrentDriverStandings(),
      drivers: this.openF1Service.getLatestSessionDrivers(),
    }).subscribe({
      next: ({ standings, drivers }) => {
        // Create a map of driver permanent number to team color
        const colorMap = new Map<string, string>();
        drivers.forEach((driver) => {
          colorMap.set(driver.driver_number.toString(), driver.team_colour);
        });
        this.teamColors.set(colorMap);

        // Standings are already sorted by championship position
        this.driverStandings.set(standings);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading driver standings:', err);
        this.error.set('Failed to load driver standings. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  protected getDriverFullName(standing: DriverStanding): string {
    return `${standing.Driver.givenName} ${standing.Driver.familyName}`;
  }

  protected getTeamName(standing: DriverStanding): string {
    return standing.Constructors.length > 0 ? standing.Constructors[0].name : 'Unknown Team';
  }

  protected getCountryFlag(nationality: string): string {
    const countryCode = this.nationalityToCode[nationality];
    if (!countryCode) return '🏁';

    // Convert country code to flag emoji
    // Regional indicator symbols start at 0x1F1E6 (127462)
    // A = 65, so 0x1F1E6 - 65 = 127397
    const codePoints = countryCode.split('').map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  protected getTeamColor(standing: DriverStanding): string {
    const color = this.teamColors().get(standing.Driver.permanentNumber);
    return color ? `#${color}` : '#667eea'; // Default to purple if no color found
  }

  protected getCardGradient(standing: DriverStanding): string {
    const baseColor = this.getTeamColor(standing);
    return `linear-gradient(135deg, ${baseColor}30 0%, ${baseColor}50 100%)`;
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }
}
