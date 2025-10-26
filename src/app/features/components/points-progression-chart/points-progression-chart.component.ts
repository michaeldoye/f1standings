import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { concatMap, delay, from, map, of, switchMap, toArray } from 'rxjs';
import { API_CONFIG, CHART_CONFIG } from '../../../core/constants/app.constants';
import { DriverStanding, Race, StandingsList } from '../../../core/models/jolpica.model';
import { JolpicaApiService } from '../../../core/services/jolpica-api.service';

interface PointsProgression {
  round: number;
  points: number;
  raceName: string;
  isProjected: boolean;
}

interface DriverSelection {
  driverId: string;
  name: string;
  teamColor: string;
  selected: boolean;
}

@Component({
  selector: 'app-points-progression-chart',
  imports: [
    BaseChartDirective,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './points-progression-chart.component.html',
  styleUrl: './points-progression-chart.component.scss',
})
export class PointsProgressionChartComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private readonly jolpicaService = inject(JolpicaApiService);

  readonly standing = input.required<DriverStanding>();
  readonly teamColor = input.required<string>();
  readonly allStandings = input.required<DriverStanding[]>();
  readonly teamColors = input.required<Map<string, string>>();

  protected readonly availableDrivers = signal<DriverSelection[]>([]);
  protected readonly selectedDriverIds = signal<string[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly spinnerDiameter = CHART_CONFIG.SPINNER_DIAMETER;

  private readonly isDarkMode = signal(false);
  private themeObserver?: MutationObserver;
  private races: Race[] = [];
  private standingsByRound: StandingsList[] = [];

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: [],
  };
  public lineChartOptions: ChartConfiguration['options'] = {};

  constructor() {
    // Detect initial theme
    this.updateDarkMode();

    // Watch for theme changes
    effect(() => {
      this.updateDarkMode();
      this.updateChartOptions();
      this.chart?.update();
    });

    // Watch for driver selection changes
    effect(() => {
      const selectedIds = this.selectedDriverIds();
      if (selectedIds.length > 0 && this.standingsByRound.length > 0) {
        this.buildMultiDriverChartData();
      }
    });

    // Observe theme changes
    this.themeObserver = new MutationObserver(() => {
      this.updateDarkMode();
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
  }

  private initializeDrivers(): void {
    const currentDriverId = this.standing().Driver.driverId;
    const drivers: DriverSelection[] = this.allStandings().map((standing) => ({
      driverId: standing.Driver.driverId,
      name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
      teamColor: this.getDriverColor(standing),
      selected: standing.Driver.driverId === currentDriverId,
    }));

    this.availableDrivers.set(drivers);
    this.selectedDriverIds.set([currentDriverId]);
  }

  private getDriverColor(standing: DriverStanding): string {
    const color = this.teamColors().get(standing.Driver.permanentNumber);
    return color ? `#${color}` : CHART_CONFIG.DEFAULT_COLOR;
  }

  protected toggleDriver(driverId: string): void {
    const drivers = this.availableDrivers();
    const driver = drivers.find((d) => d.driverId === driverId);
    if (driver) {
      driver.selected = !driver.selected;
      this.availableDrivers.set([...drivers]);

      const selectedIds = drivers.filter((d) => d.selected).map((d) => d.driverId);
      this.selectedDriverIds.set(selectedIds);
    }
  }

  private updateDarkMode(): void {
    const isDark = document.documentElement.classList.contains('dark-theme');
    this.isDarkMode.set(isDark);
  }

  private updateChartOptions(): void {
    const isDark = this.isDarkMode();
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#666';

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDark ? '#1e293b' : '#fff',
          titleColor: isDark ? '#e5e7eb' : '#222',
          bodyColor: isDark ? '#d1d5db' : '#666',
          borderColor: isDark ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return (this.lineChartData.labels?.[index] as string) || '';
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${Math.round(value as number)} points`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            color: textColor,
            font: {
              size: 10,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
            font: {
              size: 11,
            },
          },
          title: {
            display: true,
            text: 'Points',
            color: textColor,
            font: {
              size: 12,
              weight: 'bold',
            },
          },
        },
      },
    };
  }

  ngOnInit(): void {
    this.initializeDrivers();
    this.loadPointsProgression();
  }

  private loadPointsProgression(): void {
    this.jolpicaService
      .getCurrentSeasonRaces()
      .pipe(
        switchMap((races) => {
          if (races.length === 0) {
            console.warn('No races found');
            return of({ races, standingsByRound: [] as StandingsList[] });
          }

          const season = Number.parseInt(races[0].season, 10);
          const now = new Date();
          const completedRaces = races
            .filter((race) => this.getRaceDate(race).getTime() < now.getTime())
            .sort((a, b) => Number.parseInt(a.round, 10) - Number.parseInt(b.round, 10));

          if (completedRaces.length === 0) {
            console.warn('No completed races found');
            return of({ races, standingsByRound: [] as StandingsList[] });
          }

          return from(completedRaces).pipe(
            concatMap((race, index) =>
              this.jolpicaService
                .getDriverStandingsByRound(season, Number.parseInt(race.round, 10))
                .pipe(
                  map((driverStandings) => ({
                    season: season.toString(),
                    round: race.round,
                    DriverStandings: driverStandings,
                  })),
                  delay(index === 0 ? 0 : API_CONFIG.REQUEST_DELAY_MS)
                )
            ),
            toArray(),
            map((standingsByRound) => ({ races, standingsByRound }))
          );
        })
      )
      .subscribe({
        next: ({ races, standingsByRound }) => {
          if (races.length === 0) {
            console.warn('No races found');
            this.loading.set(false);
            return;
          }

          if (standingsByRound.length === 0) {
            console.warn('No standings available for completed rounds');
            this.loading.set(false);
            return;
          }

          this.races = races;
          this.standingsByRound = standingsByRound;
          this.buildMultiDriverChartData();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading points progression data:', err);
          this.loading.set(false);
        },
      });
  }

  private buildMultiDriverChartData(): void {
    const selectedIds = this.selectedDriverIds();
    if (selectedIds.length === 0 || this.standingsByRound.length === 0) {
      return;
    }

    const datasets: ChartConfiguration['data']['datasets'] = [];
    const allProgressionPoints = new Map<number, PointsProgression>();

    selectedIds.forEach((driverId) => {
      const driver = this.availableDrivers().find((d) => d.driverId === driverId);
      if (!driver) return;

      const progression = this.buildDriverProgression(driverId);
      if (progression.length === 0) return;

      // Track all rounds and their progression data
      progression.forEach((p) => {
        if (!allProgressionPoints.has(p.round)) {
          allProgressionPoints.set(p.round, p);
        }
      });

      // Create datasets for actual and projected data
      const actualDataPoints: (number | null)[] = [];
      const projectedDataPoints: (number | null)[] = [];

      progression.forEach((p) => {
        if (p.isProjected) {
          actualDataPoints.push(null);
          projectedDataPoints.push(p.points);
        } else {
          actualDataPoints.push(p.points);
          const isLastActual =
            progression.findIndex((item) => item.isProjected) - 1 === progression.indexOf(p);
          projectedDataPoints.push(isLastActual ? p.points : null);
        }
      });

      // Actual data dataset
      datasets.push({
        data: actualDataPoints,
        label: driver.name,
        borderColor: driver.teamColor,
        backgroundColor: `${driver.teamColor}20`,
        pointBackgroundColor: driver.teamColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: driver.teamColor,
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: false,
      });

      // Projected data dataset
      datasets.push({
        data: projectedDataPoints,
        label: `${driver.name} (Projected)`,
        borderColor: `${driver.teamColor}80`,
        backgroundColor: `${driver.teamColor}10`,
        pointBackgroundColor: `${driver.teamColor}80`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `${driver.teamColor}80`,
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: false,
      });
    });

    // Sort rounds and create labels from race names
    const sortedRounds = Array.from(allProgressionPoints.entries()).sort(
      ([roundA], [roundB]) => roundA - roundB
    );

    const labels = sortedRounds.map(([, progression]) => progression.raceName);

    this.lineChartData = {
      labels,
      datasets,
    };

    this.chart?.update();
  }

  private buildDriverProgression(driverId: string): PointsProgression[] {
    const progression: PointsProgression[] = [];

    // Build actual points progression from completed races
    this.standingsByRound.forEach((roundStandings) => {
      const driverStanding = roundStandings.DriverStandings.find(
        (ds) => ds.Driver.driverId === driverId
      );

      if (driverStanding) {
        const roundNum = Number.parseInt(roundStandings.round, 10);
        const race = this.races.find((r) => Number.parseInt(r.round, 10) === roundNum);

        progression.push({
          round: roundNum,
          points: Number.parseFloat(driverStanding.points),
          raceName: race?.raceName || `Round ${roundNum}`,
          isProjected: false,
        });
      }
    });

    // Sort progression by round number
    progression.sort((a, b) => a.round - b.round);

    // Add projections
    this.addProjections(progression);

    return progression;
  }

  private addProjections(progression: PointsProgression[]): void {
    const lastRound = progression.length > 0 ? progression[progression.length - 1] : null;
    if (!lastRound || progression.length === 0) return;

    const sortedRaces = [...this.races].sort(
      (a, b) => Number.parseInt(a.round, 10) - Number.parseInt(b.round, 10)
    );

    const remainingRaces = sortedRaces.filter((race) => {
      const roundNum = Number.parseInt(race.round, 10);
      const raceDate = this.getRaceDate(race);
      return roundNum > lastRound.round && raceDate.getTime() > new Date().getTime();
    });

    if (remainingRaces.length === 0) return;

    // Calculate weighted average points per race
    let weightedAvg = 0;
    let totalWeight = 0;
    const recentRacesCount = Math.min(5, progression.length);

    for (let i = 0; i < recentRacesCount; i++) {
      const index = progression.length - 1 - i;
      const currentPoints = progression[index].points;
      const previousPoints = index > 0 ? progression[index - 1].points : 0;
      const pointsGained = currentPoints - previousPoints;

      const weight = recentRacesCount - i;
      weightedAvg += pointsGained * weight;
      totalWeight += weight;
    }

    const avgPointsPerRace = totalWeight > 0 ? weightedAvg / totalWeight : 0;

    let lastProjectedPoints = lastRound.points;
    remainingRaces.forEach((race) => {
      const roundNum = Number.parseInt(race.round, 10);
      lastProjectedPoints += avgPointsPerRace;

      progression.push({
        round: roundNum,
        points: lastProjectedPoints,
        raceName: race.raceName,
        isProjected: true,
      });
    });
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
}
