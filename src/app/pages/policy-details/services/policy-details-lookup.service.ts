import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay } from 'rxjs';
import { ReinsurancePeriod } from './policy-details.service';

interface LookupResponse<T> { items: T[] }

@Injectable({ providedIn: 'root' })
export class PolicyDetailsLookupService {
  // Dummy endpoints for future replacement
  private readonly reinsurersApi = '/api/policy-details/reinsurers';
  private readonly treatyIdsApi = '/api/policy-details/treaty-ids';

  // Mock fallbacks used today (match API response shape)
  private readonly reinsurersMockUrl = '/assets/mock-data/policy-reinsurers.json';
  private readonly treatyIdsMockUrl = '/assets/mock-data/policy-treaty-ids.json';

  private reinsurers$?: Observable<string[]>;
  private treatyIds$?: Observable<string[]>;

  constructor(private readonly http: HttpClient) {}

  getReinsurers(): Observable<string[]> {
    if (!this.reinsurers$) {
      const api$ = this.http.get<LookupResponse<string>>(this.reinsurersApi).pipe(
        map((resp) => (resp?.items ?? []).filter(Boolean))
      );
      const fallback$ = this.http.get<LookupResponse<string>>(this.reinsurersMockUrl).pipe(
        map((resp) => (resp?.items ?? []).filter(Boolean))
      );
      const source$ = (isDevMode() ? fallback$ : api$.pipe(catchError(() => fallback$))).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.reinsurers$ = source$;
    }
    return this.reinsurers$;
  }

  getTreatyIds(): Observable<string[]> {
    if (!this.treatyIds$) {
      const api$ = this.http.get<LookupResponse<string>>(this.treatyIdsApi).pipe(
        map((resp) => (resp?.items ?? []).filter(Boolean))
      );
      const fallback$ = this.http.get<LookupResponse<string>>(this.treatyIdsMockUrl).pipe(
        map((resp) => (resp?.items ?? []).filter(Boolean))
      );
      const source$ = (isDevMode() ? fallback$ : api$.pipe(catchError(() => fallback$))).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.treatyIds$ = source$;
    }
    return this.treatyIds$;
  }
}
