import { Component, OnDestroy, OnInit, ViewChild, effect, inject, input, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DriverStanding, Race, StandingsList } from '../../../core/models/jolpica.model';
import { JolpicaApiService } from '../../../core/services/jolpica-api.service';
import { forkJoin } from 'rxjs';

interface PointsProgression {
  round: number;
  points: number;
  raceName: string;
  isProjected: boolean;
}

@Component({
  selector: 'app-points-progression-chart',
  imports: [BaseChartDirective],
  templateUrl: './points-progression-chart.component.html',
  styleUrl: './points-progression-chart.component.scss',
})
export class PointsProgressionChartComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private readonly jolpicaService = inject(JolpicaApiService);

  readonly standing = input.required<DriverStanding>();
  readonly teamColor = input.required<string>();

  private readonly isDarkMode = signal(false);
  private themeObserver?: MutationObserver;

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
      this.updateChartOptions();
      this.chart?.update();
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
              return this.lineChartData.labels?.[index] as string || '';
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
    this.loadPointsProgression();
  }

  private loadPointsProgression(): void {
    this.jolpicaService.getCurrentSeasonRaces().subscribe({
      next: (races) => {
        if (races.length === 0) {
          console.warn('No races found');
          return;
        }

        // Get season from races data
        const season = parseInt(races[0].season, 10);

        // Determine which races are completed
        const now = new Date();
        const completedRaces = races.filter((race) => {
          const raceDate = this.getRaceDate(race);
          return raceDate.getTime() < now.getTime();
        });

        // Fetch standings for each completed round
        const standingsRequests = completedRaces.map((race) =>
          this.jolpicaService.getDriverStandingsByRound(season, parseInt(race.round, 10))
        );

        if (standingsRequests.length === 0) {
          console.warn('No completed races found');
          return;
        }

        forkJoin(standingsRequests).subscribe({
          next: (standingsArray) => {
            // Combine standings with race info
            const standingsByRound: StandingsList[] = completedRaces.map((race, index) => ({
              season: season.toString(),
              round: race.round,
              DriverStandings: standingsArray[index],
            }));

            this.buildChartData(standingsByRound, races);
          },
          error: (err) => {
            console.error('Error loading standings by round:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error loading races:', err);
      },
    });
  }

  private buildChartData(standingsByRound: StandingsList[], races: Race[]): void {
    const driverId = this.standing().Driver.driverId;
    const progression: PointsProgression[] = [];

    // Build actual points progression from completed races
    standingsByRound.forEach((roundStandings) => {
      const driverStanding = roundStandings.DriverStandings.find(
        (ds) => ds.Driver.driverId === driverId
      );

      if (driverStanding) {
        const roundNum = parseInt(roundStandings.round, 10);
        const race = races.find((r) => parseInt(r.round, 10) === roundNum);

        progression.push({
          round: roundNum,
          points: parseFloat(driverStanding.points),
          raceName: race?.raceName || `Round ${roundNum}`,
          isProjected: false,
        });
      }
    });

    // Sort progression by round number to ensure correct order
    progression.sort((a, b) => a.round - b.round);

    // Calculate projection for remaining races
    const lastRound = progression.length > 0 ? progression[progression.length - 1] : null;
    if (lastRound && progression.length > 0) {
      // Sort races by round number
      const sortedRaces = [...races].sort((a, b) => parseInt(a.round, 10) - parseInt(b.round, 10));

      const remainingRaces = sortedRaces.filter((race) => {
        const roundNum = parseInt(race.round, 10);
        const raceDate = this.getRaceDate(race);
        return roundNum > lastRound.round && raceDate.getTime() > new Date().getTime();
      });

      // Calculate weighted average points per race (giving more weight to recent races)
      let weightedAvg = 0;
      let totalWeight = 0;
      const recentRacesCount = Math.min(5, progression.length); // Use last 5 races or all if less

      for (let i = 0; i < recentRacesCount; i++) {
        const index = progression.length - 1 - i;
        const currentPoints = progression[index].points;
        const previousPoints = index > 0 ? progression[index - 1].points : 0;
        const pointsGained = currentPoints - previousPoints;

        // Weight: more recent races get higher weight
        const weight = recentRacesCount - i;
        weightedAvg += pointsGained * weight;
        totalWeight += weight;
      }

      const avgPointsPerRace = totalWeight > 0 ? weightedAvg / totalWeight : 0;

      let lastProjectedPoints = lastRound.points;
      remainingRaces.forEach((race) => {
        const roundNum = parseInt(race.round, 10);
        lastProjectedPoints += avgPointsPerRace;

        progression.push({
          round: roundNum,
          points: lastProjectedPoints,
          raceName: race.raceName,
          isProjected: true,
        });
      });
    }

    // Update chart data
    // Create aligned data arrays where each index corresponds to the same round in labels
    const labels = progression.map((p) => `R${p.round}`);
    const actualDataPoints: (number | null)[] = [];
    const projectedDataPoints: (number | null)[] = [];

    progression.forEach((p) => {
      if (p.isProjected) {
        actualDataPoints.push(null);
        projectedDataPoints.push(p.points);
      } else {
        actualDataPoints.push(p.points);
        // Add connection point for projected line
        const isLastActual = progression.findIndex((item) => item.isProjected) - 1 === progression.indexOf(p);
        projectedDataPoints.push(isLastActual ? p.points : null);
      }
    });

    this.lineChartData = {
      labels,
      datasets: [
        {
          data: actualDataPoints,
          label: `${this.standing().Driver.givenName} ${this.standing().Driver.familyName}`,
          borderColor: this.teamColor(),
          backgroundColor: `${this.teamColor()}20`,
          pointBackgroundColor: this.teamColor(),
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: this.teamColor(),
          fill: 'origin',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          spanGaps: false,
        },
        {
          data: projectedDataPoints,
          label: 'Projected',
          borderColor: `${this.teamColor()}80`,
          backgroundColor: `${this.teamColor()}10`,
          pointBackgroundColor: `${this.teamColor()}80`,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: `${this.teamColor()}80`,
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          borderDash: [10, 5],
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: false,
        },
      ],
    };

    this.chart?.update();
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
