import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DriverStanding, JolpicaResponse } from '../models/jolpica.model';

@Injectable({
  providedIn: 'root',
})
export class JolpicaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';

  getCurrentDriverStandings(): Observable<DriverStanding[]> {
    return this.http.get<JolpicaResponse>(`${this.baseUrl}/current/driverStandings.json`).pipe(
      map((response) => {
        const standingsLists = response.MRData.StandingsTable.StandingsLists;
        return standingsLists.length > 0 ? standingsLists[0].DriverStandings : [];
      })
    );
  }

  getDriverStandingsByYear(year: number): Observable<DriverStanding[]> {
    return this.http.get<JolpicaResponse>(`${this.baseUrl}/${year}/driverStandings.json`).pipe(
      map((response) => {
        const standingsLists = response.MRData.StandingsTable.StandingsLists;
        return standingsLists.length > 0 ? standingsLists[0].DriverStandings : [];
      })
    );
  }
}
