import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import {
  CHART_CONFIG,
  F1_POINTS,
  NATIONALITY_TO_CODE,
} from '../../../core/constants/app.constants';
import { DriverStanding, Race } from '../../../core/models/jolpica.model';
import { FilterService } from '../../../core/services/filter.service';
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
  protected readonly step = signal(-1);
  private readonly jolpicaService = inject(JolpicaApiService);
  private readonly openF1Service = inject(OpenF1ApiService);
  private readonly filterService = inject(FilterService);

  protected readonly driverStandings = signal<DriverStanding[]>([]);
  protected readonly filteredStandings = computed(() => {
    const query = this.filterService.filterValue();
    const list = this.driverStandings();
    if (!query) {
      return list;
    }

    return list.filter((standing) => {
      const fullName = `${standing.Driver.givenName} ${standing.Driver.familyName}`.toLowerCase();
      const code = standing.Driver.code?.toLowerCase() ?? '';
      const team = this.getTeamName(standing).toLowerCase();

      return fullName.includes(query) || code.includes(query) || team.includes(query);
    });
  });
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly teamColors = signal<Map<string, string>>(new Map());
  protected readonly championshipProbabilities = signal<Map<string, number>>(new Map());

  constructor() {
    effect(() => {
      this.filterService.filterValue();
      this.step.set(-1);
    });
  }

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
      maxRemainingPoints += F1_POINTS.MAX_RACE_POINTS;
      if (race.Sprint) {
        maxRemainingPoints += F1_POINTS.MAX_SPRINT_POINTS;
      }
    });

    // Get leader's points
    const leaderPoints = Number.parseFloat(standings[0].points);

    // Calculate probability for each driver
    standings.forEach((standing) => {
      const driverPoints = Number.parseFloat(standing.points);
      const maxPossiblePoints = driverPoints + maxRemainingPoints;
      const pointsDeficit = leaderPoints - driverPoints;

      let probability: number;

      if (maxPossiblePoints < leaderPoints && standing.position !== '1') {
        // Mathematically eliminated
        probability = 0;
      } else if (standing.position === '1') {
        // Current leader - calculate based on how secure their lead is
        const secondPlacePoints = standings.length > 1 ? Number.parseFloat(standings[1].points) : 0;
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
    const countryCode = NATIONALITY_TO_CODE[nationality];
    if (!countryCode) return '🏁';

    // Convert country code to flag emoji
    // Regional indicator symbols start at 0x1F1E6 (127462)
    // A = 65, so 0x1F1E6 - 65 = 127397
    const codePoints = countryCode.split('').map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  protected getTeamColor(standing: DriverStanding): string {
    const color = this.teamColors().get(standing.Driver.permanentNumber);
    return color ? `#${color}` : CHART_CONFIG.DEFAULT_COLOR;
  }

  protected getTeamName(standing: DriverStanding): string {
    return standing.Constructors.length > 0 ? standing.Constructors[0].name : 'Unknown Team';
  }

  protected getDriverFullName(standing: DriverStanding): string {
    return `${standing.Driver.givenName} ${standing.Driver.familyName}`;
  }

  protected getChampionshipProbability(standing: DriverStanding): number {
    return this.championshipProbabilities().get(standing.Driver.driverId) || 0;
  }

  protected getProbabilityTooltip(standing: DriverStanding): string {
    const probability = this.getChampionshipProbability(standing);
    const currentPoints = Number.parseFloat(standing.points);
    const standings = this.driverStandings();

    if (standings.length === 0) return '';

    const leaderPoints = Number.parseFloat(standings[0].points);
    const pointsDeficit = leaderPoints - currentPoints;

    let explanation = '';

    if (standing.position === '1') {
      explanation += `As the championship leader with ${currentPoints} points, `;
      if (probability === 100) {
        explanation += `${standing.Driver.givenName} has mathematically secured the championship!`;
      } else {
        const secondPlace = standings.length > 1 ? standings[1] : null;
        const margin = secondPlace ? currentPoints - Number.parseFloat(secondPlace.points) : 0;
        explanation += `${standing.Driver.givenName} has a ${margin}-point lead. The probability (${probability}%) is based on how secure ${standing.Driver.givenName}'s lead is relative to the remaining points available.`;
      }
    } else if (probability === 0) {
      explanation += `With ${currentPoints} points and a ${pointsDeficit}-point deficit, ${standing.Driver.givenName} has been mathematically eliminated from championship contention. Even winning all remaining races wouldn't be enough to catch the leader.`;
    } else {
      explanation += `With ${currentPoints} points and a ${pointsDeficit}-point deficit from the leader, ${standing.Driver.givenName}'s probability (${probability}%) is calculated based on:\n\n`;
      explanation += `Points deficit vs remaining possible points,\n`;
      explanation += `Maximum points per race (25),\n`;
      explanation += `Maximum points per sprint (8),\n\n`;
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
