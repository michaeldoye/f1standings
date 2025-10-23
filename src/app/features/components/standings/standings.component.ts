import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { DriverStanding, Race } from '../../../core/models/jolpica.model';
import { JolpicaApiService } from '../../../core/services/jolpica-api.service';
import { OpenF1ApiService } from '../../../core/services/openf1-api.service';
import { DriverStandingCardComponent } from '../driver-standing-card/driver-standing-card.component';

@Component({
  selector: 'app-standings',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DriverStandingCardComponent,
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
  protected readonly championshipProbabilities = signal<Map<string, number>>(new Map());

  // F1 Points system constants
  private readonly MAX_RACE_POINTS = 25; // 25 for win
  private readonly MAX_SPRINT_POINTS = 8; // Sprint race winner

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

    // Fetch standings, team colors, and race calendar in parallel
    forkJoin({
      standings: this.jolpicaService.getCurrentDriverStandings(),
      drivers: this.openF1Service.getLatestSessionDrivers(),
      races: this.jolpicaService.getCurrentSeasonRaces(),
    }).subscribe({
      next: ({ standings, drivers, races }) => {
        // Create a map of driver permanent number to team color
        const colorMap = new Map<string, string>();
        drivers.forEach((driver) => {
          colorMap.set(driver.driver_number.toString(), driver.team_colour);
        });
        this.teamColors.set(colorMap);

        // Calculate championship probabilities
        const probabilities = this.calculateChampionshipProbabilities(standings, races);
        this.championshipProbabilities.set(probabilities);

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

  private calculateChampionshipProbabilities(
    standings: DriverStanding[],
    races: Race[]
  ): Map<string, number> {
    const probabilities = new Map<string, number>();

    if (standings.length === 0) return probabilities;

    // Get remaining races (races that haven't happened yet)
    const now = new Date();
    const remainingRaces = races.filter((race) => this.getRaceDate(race).getTime() > now.getTime());

    // Calculate maximum remaining points
    let maxRemainingPoints = 0;
    remainingRaces.forEach((race) => {
      maxRemainingPoints += this.MAX_RACE_POINTS;
      if (race.Sprint) {
        maxRemainingPoints += this.MAX_SPRINT_POINTS;
      }
    });

    // Get leader's points
    const leaderPoints = parseFloat(standings[0].points);

    // Calculate probability for each driver
    standings.forEach((standing) => {
      const driverPoints = parseFloat(standing.points);
      const maxPossiblePoints = driverPoints + maxRemainingPoints;
      const pointsDeficit = leaderPoints - driverPoints;

      let probability: number;

      if (maxPossiblePoints < leaderPoints && standing.position !== '1') {
        // Mathematically eliminated
        probability = 0;
      } else if (standing.position === '1') {
        // Current leader - calculate based on how secure their lead is
        const secondPlacePoints = standings.length > 1 ? parseFloat(standings[1].points) : 0;
        const leadMargin = leaderPoints - secondPlacePoints;

        if (leadMargin > maxRemainingPoints) {
          // Championship already secured
          probability = 100;
        } else {
          // Leader with varying security
          const securityRatio = leadMargin / maxRemainingPoints;
          probability = Math.max(50, Math.min(99, 50 + securityRatio * 49));
        }
      } else {
        // Calculate probability based on points deficit and remaining races
        const catchUpRatio = pointsDeficit / maxRemainingPoints;

        if (catchUpRatio > 1) {
          probability = 0; // Eliminated
        } else if (catchUpRatio > 0.9) {
          probability = Math.max(0.1, (1 - catchUpRatio) * 10);
        } else if (catchUpRatio > 0.7) {
          probability = (1 - catchUpRatio) * 30;
        } else if (catchUpRatio > 0.5) {
          probability = (1 - catchUpRatio) * 50;
        } else {
          probability = Math.min(45, (1 - catchUpRatio) * 60);
        }
      }

      probabilities.set(standing.Driver.driverId, Math.round(probability * 10) / 10);
    });

    return probabilities;
  }

  private getRaceDate(race: Race): Date {
    const baseTime = race.time ?? '00:00:00';
    const hasTimezone = /[zZ]|[+\-]\d{2}:\d{2}$/.test(baseTime);
    const normalizedTime = hasTimezone ? baseTime : `${baseTime}Z`;
    const raceDate = new Date(`${race.date}T${normalizedTime}`);

    if (Number.isNaN(raceDate.getTime())) {
      return new Date(`${race.date}T00:00:00Z`);
    }

    return raceDate;
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

  protected getChampionshipProbability(standing: DriverStanding): number {
    return this.championshipProbabilities().get(standing.Driver.driverId) || 0;
  }

  protected getProbabilityTooltip(standing: DriverStanding): string {
    const probability = this.getChampionshipProbability(standing);
    const currentPoints = parseFloat(standing.points);
    const standings = this.driverStandings();

    if (standings.length === 0) return '';

    const leaderPoints = parseFloat(standings[0].points);
    const pointsDeficit = leaderPoints - currentPoints;

    let explanation = 'Win Probability Calculation:\n\n';

    if (standing.position === '1') {
      explanation += `As the championship leader with ${currentPoints} points, `;
      if (probability === 100) {
        explanation += 'you have mathematically secured the championship!';
      } else {
        const secondPlace = standings.length > 1 ? standings[1] : null;
        const margin = secondPlace ? currentPoints - parseFloat(secondPlace.points) : 0;
        explanation += `you have a ${margin}-point lead. Your probability (${probability}%) is based on how secure your lead is relative to the remaining points available.`;
      }
    } else if (probability === 0) {
      explanation += `With ${currentPoints} points and a ${pointsDeficit}-point deficit, you have been mathematically eliminated from championship contention. Even winning all remaining races wouldn't be enough to catch the leader.`;
    } else {
      explanation += `With ${currentPoints} points and a ${pointsDeficit}-point deficit from the leader, your probability (${probability}%) is calculated based on:\n\n`;
      explanation += `• Points deficit vs remaining possible points\n`;
      explanation += `• Maximum points per race: 25\n`;
      explanation += `• Maximum points per sprint: 8\n\n`;
      explanation += `The larger the deficit relative to remaining points, the lower the probability.`;
    }

    return explanation;
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
