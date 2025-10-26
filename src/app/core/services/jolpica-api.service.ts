import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../constants/app.constants';
import {
  DriverStanding,
  JolpicaResponse,
  Race,
  RaceScheduleResponse,
} from '../models/jolpica.model';

@Injectable({
  providedIn: 'root',
})
export class JolpicaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.JOLPICA_BASE_URL;

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

  getCurrentSeasonRaces(): Observable<Race[]> {
    return this.http
      .get<RaceScheduleResponse>(`${this.baseUrl}/current.json`)
      .pipe(map((response) => response.MRData.RaceTable.Races));
  }

  getRacesByYear(year: number): Observable<Race[]> {
    return this.http
      .get<RaceScheduleResponse>(`${this.baseUrl}/${year}.json`)
      .pipe(map((response) => response.MRData.RaceTable.Races));
  }

  /**
   * Get driver standings for a specific round
   */
  getDriverStandingsByRound(year: number, round: number): Observable<DriverStanding[]> {
    return this.http
      .get<JolpicaResponse>(`${this.baseUrl}/${year}/${round}/driverStandings.json`)
      .pipe(
        map((response) => {
          const standingsLists = response.MRData.StandingsTable.StandingsLists;
          return standingsLists.length > 0 ? standingsLists[0].DriverStandings : [];
        })
      );
  }
}
