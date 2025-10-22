import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Driver, Session, SessionResult } from '../models/driver.model';

@Injectable({
  providedIn: 'root',
})
export class OpenF1ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.openf1.org/v1';

  getLatestSessionDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.baseUrl}/drivers?session_key=latest`);
  }

  getDriversBySessionKey(sessionKey: number): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.baseUrl}/drivers?session_key=${sessionKey}`);
  }

  getSessionsByYear(year: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/sessions?year=${year}`);
  }

  getLatestSession(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/sessions?session_key=latest`);
  }

  getSessionResults(sessionKey: number): Observable<SessionResult[]> {
    return this.http.get<SessionResult[]>(
      `${this.baseUrl}/session_result?session_key=${sessionKey}`
    );
  }
}
