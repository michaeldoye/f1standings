import { Routes } from '@angular/router';
import { StandingsComponent } from './features/components/standings/standings.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full',
  },
  {
    path: 'standings',
    component: StandingsComponent,
  },
];
