import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DriverStanding } from '../../../core/models/jolpica.model';
import {
  ProbabilityExplanationDialogComponent,
  ProbabilityExplanationData,
} from '../probability-explanation-dialog/probability-explanation-dialog.component';

@Component({
  selector: 'app-driver-stats',
  imports: [MatIconModule],
  templateUrl: './driver-stats.component.html',
  styleUrl: './driver-stats.component.scss',
})
export class DriverStatsComponent {
  private readonly dialog = inject(MatDialog);

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

  protected openProbabilityExplanation(): void {
    this.dialog.open<
      ProbabilityExplanationDialogComponent,
      ProbabilityExplanationData
    >(ProbabilityExplanationDialogComponent, {
      data: {
        explanation: this.probabilityTooltip(),
      },
    });
  }
}
