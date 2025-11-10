import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { ReinsurerData } from '../reinsurance.types';
import { HttpService } from '../../../../services/http.service';
import { environment } from '../../../../environments/environment.dev';

interface LookupResponse<T> { items: T[] }

@Injectable({ providedIn: 'root' })
export class ReinsuranceLookupService {
  // Dummy API endpoints to be replaced when backend is ready
   private readonly reinsurerstreatyIdsApi='/api/reinsurancerates/dashboard/reinsurer-search-view';
   private readonly reinsurersApi = '/api/reinsurance/reinsurers';
  private readonly treatyIdsApi = '/api/reinsurance/treaty-ids';

  // Asset fallbacks
  private readonly reinusrancetreatyMockUrl = '/assets/mock-data/reinsurer-treaty-dropdown.json';
  private readonly treatiesMockUrl = '/assets/mock-data/mock-reinsurance-details.json';

  private reinsurerstreatyId$?: Observable<any>;
  private reinsurers$?: Observable<string[]>;
  private treatyIds$?: Observable<string[]>;

  constructor(private readonly http: HttpClient,private readonly https:HttpService) {}

   getReinsurersTreatyDropdown(): Observable<any> {
    if (!this.reinsurerstreatyId$) {
      const api$ = this.https.get<any>(this.reinsurerstreatyIdsApi).pipe(
        map(resp => {
          return {
            reinsurerDetails: Array.from(new Set((resp?.reinsurerDetails || []).map((r: any) => (r || '').trim()).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b)),
            treatyID: Array.from(new Set((resp?.treatyID || []).map((r: any) => (r || '').trim()).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b))
          };
        }),
      );
      const fallback$ = this.http.get<any>(this.reinusrancetreatyMockUrl).pipe(
        map(resp => {
          return {
            reinsurerDetails: Array.from(new Set((resp?.reinsurerDetails || []).map((r: any) => (r || '').trim()).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b)),
            treatyID: Array.from(new Set((resp?.treatyID || []).map((r: any) => (r || '').trim()).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b))
          };
        })
      );
       
      const source$ = (environment?.isDevMode? fallback$ : api$.pipe(catchError(() => fallback$))).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.reinsurerstreatyId$ = source$;
    }
    return this.reinsurerstreatyId$;
  }

  getReinsurers(): Observable<string[]> {
    if (!this.reinsurers$) {
      const api$ = this.http.get<LookupResponse<string>>(this.reinsurersApi).pipe(
        map(resp => (resp?.items ?? []).filter(Boolean)),
      );
      const fallback$ = this.http.get<ReinsurerData[]>(this.treatiesMockUrl).pipe(
        map(list => Array.from(new Set((list || []).map(r => (r.reinsurerName || '').trim()).filter(Boolean))).sort((a,b) => a.localeCompare(b)))
      );
      const source$ = (environment?.isDevMode ? fallback$ : api$.pipe(catchError(() => fallback$))).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.reinsurers$ = source$;
    }
    return this.reinsurers$;
  }

  getTreatyIds(): Observable<string[]> {
    if (!this.treatyIds$) {
      const api$ = this.http.get<LookupResponse<string>>(this.treatyIdsApi).pipe(
        map(resp => (resp?.items ?? []).filter(Boolean)),
      );
      const fallback$ = this.http.get<ReinsurerData[]>(this.treatiesMockUrl).pipe(
        map(list => Array.from(new Set((list || []).map(r => (r.treatyId || '').trim()).filter(Boolean))).sort())
      );
      const source$ = (environment?.isDevMode ? fallback$ : api$.pipe(catchError(() => fallback$))).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.treatyIds$ = source$;
    }
    return this.treatyIds$;
  }
}
