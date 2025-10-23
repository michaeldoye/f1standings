import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DriverStanding } from '../../../core/models/jolpica.model';

@Component({
  selector: 'app-driver-stats',
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './driver-stats.component.html',
  styleUrl: './driver-stats.component.scss',
})
export class DriverStatsComponent {
  readonly standing = input.required<DriverStanding>();
  readonly teamColor = input.required<string>();
  readonly probability = input.required<number>();
  readonly probabilityTooltip = input.required<string>();

  protected getCardGradient(): string {
    const baseColor = this.teamColor();
    return `linear-gradient(135deg, ${baseColor}30 0%, ${baseColor}50 100%)`;
  }

  protected getTeamName(): string {
    return this.standing().Constructors.length > 0
      ? this.standing().Constructors[0].name
      : 'Unknown Team';
  }
}
