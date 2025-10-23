import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ProbabilityExplanationData {
  explanation: string;
}

@Component({
  selector: 'app-probability-explanation-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './probability-explanation-dialog.component.html',
  styleUrl: './probability-explanation-dialog.component.scss',
})
export class ProbabilityExplanationDialogComponent {
  readonly data = inject<ProbabilityExplanationData>(MAT_DIALOG_DATA);
}
