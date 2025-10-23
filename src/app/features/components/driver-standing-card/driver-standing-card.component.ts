import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DriverStanding } from '../../../core/models/jolpica.model';
import { DriverInfoComponent } from '../driver-info/driver-info.component';
import { DriverStatsComponent } from '../driver-stats/driver-stats.component';
import { PointsProgressionChartComponent } from '../points-progression-chart/points-progression-chart.component';

@Component({
  selector: 'app-driver-standing-card',
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    DriverStatsComponent,
    DriverInfoComponent,
    PointsProgressionChartComponent,
  ],
  templateUrl: './driver-standing-card.component.html',
  styleUrl: './driver-standing-card.component.scss',
})
export class DriverStandingCardComponent {
  readonly standing = input.required<DriverStanding>();
  readonly expanded = input.required<boolean>();
  readonly countryFlag = input.required<string>();
  readonly teamColor = input.required<string>();
  readonly probability = input.required<number>();
  readonly probabilityTooltip = input.required<string>();
  readonly isFirst = input.required<boolean>();
  readonly isLast = input.required<boolean>();

  readonly opened = output<void>();
  readonly previous = output<void>();
  readonly next = output<void>();

  protected getDriverFullName(): string {
    return `${this.standing().Driver.givenName} ${this.standing().Driver.familyName}`;
  }
}
