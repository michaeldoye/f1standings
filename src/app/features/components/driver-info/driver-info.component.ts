import { Component, input } from '@angular/core';
import { DriverStanding } from '../../../core/models/jolpica.model';

@Component({
  selector: 'app-driver-info',
  imports: [],
  templateUrl: './driver-info.component.html',
  styleUrl: './driver-info.component.scss',
})
export class DriverInfoComponent {
  readonly standing = input.required<DriverStanding>();

  protected getDriverFullName(): string {
    return `${this.standing().Driver.givenName} ${this.standing().Driver.familyName}`;
  }
}
