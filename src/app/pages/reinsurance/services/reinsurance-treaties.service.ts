import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ReinsurerData } from '../reinsurance.types';
import { environment } from '../../../../environments/environment.dev';

export interface TreatySearchFilters {
  reinsurerName?: string | null;
  treatyId?: string | null;
  start?: string | null; // yyyy-mm-dd
  end?: string | null;   // yyyy-mm-dd
}

@Injectable({ providedIn: 'root' })
export class ReinsuranceTreatiesService {
  private readonly searchApi = '/api/reinsurance/treaties/search';
  private readonly mockUrl = '/assets/mock-data/mock-reinsurance-details.json';

  constructor(private readonly http: HttpClient) {}

  search(filters: TreatySearchFilters): Observable<ReinsurerData[]> {
    if (!(environment?.isDevMode) ) {
      return this.http.post<ReinsurerData[]>(this.searchApi, filters).pipe(
        catchError(() => this.filterMock(filters))
      );
    }
    return this.filterMock(filters);
  }

  private filterMock(filters: TreatySearchFilters): Observable<ReinsurerData[]> {
    return this.http.get<ReinsurerData[]>(this.mockUrl).pipe(
      map(list => this.applyFilters(list || [], filters))
    );
  }

  private applyFilters(list: ReinsurerData[], filters: TreatySearchFilters): ReinsurerData[] {
    const reinsurer = (filters.reinsurerName || '').trim();
    const treatyId = (filters.treatyId || '').trim();
    const s = (filters.start || '').slice(0, 10) || null;
    const e = (filters.end || '').slice(0, 10) || null;

    const within = (row: ReinsurerData) => {
      if (!s && !e) return true;
      if (s && e) return row.periodEndDate >= s && row.periodStartDate <= e;
      if (s) return row.periodEndDate >= s;
      return row.periodStartDate <= (e as string);
    };

    return list.filter(r => {
      const matchesReinsurer = !reinsurer || r.reinsurerName === reinsurer;
      const matchesTreaty = !treatyId || r.treatyId === treatyId;
      return matchesReinsurer && matchesTreaty && within(r);
    });
  }
}
