import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ReinsurancePeriod } from '../../policy-details/services/policy-details.service';
import { HttpService } from '../../../../services/http.service';
import { environment } from '../../../../environments/environment.dev';

export interface PeriodSearchFilters {
  reinsurerName?: string | null;
  reinsurerId?: string | null; // NAIC
  treatyId?: string | null;
  start?: string | null; // yyyy-mm-dd
  end?: string | null;   // yyyy-mm-dd
}

@Injectable({ providedIn: 'root' })
export class ReinsurancePeriodsService {
  // Dummy API endpoint to be replaced once backend is available
  private readonly searchApi = '/api/reinsurance/periods/search';
  private readonly mockUrl = 'assets/mock-data/policy-periods.json';

  constructor(private readonly http: HttpClient,private readonly https:HttpService) {}

  search(filters: PeriodSearchFilters): Observable<ReinsurancePeriod[]> {
    if (!environment?.isDevMode) {
      // When backend is available, this POST will be used
      const params = new HttpParams({ fromObject: filters as { [param: string]: string | number | boolean | readonly (string | number | boolean)[] } });
      return this.https.get<ReinsurancePeriod[]>(this.searchApi,  { params: params }).pipe(
           map(resp => (resp)),
        catchError(() => this.filterMock(filters))
      );
    }
    // Dev fallback to mock JSON with client-side filtering
    return this.filterMock(filters);
  }

  private filterMock(filters: PeriodSearchFilters): Observable<ReinsurancePeriod[]> {
    return this.http.get<ReinsurancePeriod[]>(this.mockUrl).pipe(
      map(list => this.applyFilters(list || [], filters))
    );
  }

  private applyFilters(list: ReinsurancePeriod[], filters: PeriodSearchFilters): ReinsurancePeriod[] {
    const reinsurer = (filters.reinsurerName || '').trim();
    const treatyId = (filters.treatyId || '').trim();
    const s = (filters.start || '').slice(0, 10) || null;
    const e = (filters.end || '').slice(0, 10) || null;

    const daysBetween = (a?: string | null, b?: string | null) => {
      if (!a || !b) return 0;
      const d1 = new Date(`${a}T00:00:00Z`).getTime();
      const d2 = new Date(`${b}T00:00:00Z`).getTime();
      return Math.max(0, Math.round((d2 - d1) / 86400000) + 1);
    };
    const isFullMonthRange = (a?: string | null, b?: string | null) => {
      if (!a || !b) return false;
      const start = new Date(`${a}T00:00:00Z`);
      const end = new Date(`${b}T00:00:00Z`);
      const isFirst = start.getUTCDate() === 1;
      const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
      return isFirst && end.getUTCDate() === lastDay && start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();
    };
    const includeMonth = !!(s && e && (daysBetween(s, e) > 7 || isFullMonthRange(s, e)));

    return list.filter(p => {
      const matchesReinsurer = !reinsurer || p.reinsurerName === reinsurer;
      const matchesTreaty = !treatyId || p.treatyId === treatyId;
      // overlap logic to include cross-month weeks
      const within = (s && e) ? (p.periodEndDate >= s && p.periodStartDate <= e)
                    : (s ? p.periodEndDate >= s : (e ? p.periodStartDate <= e : true));
      const typeOk = p.periodType === 'Week' || (includeMonth && p.periodType === 'Month');
      return typeOk && within && matchesReinsurer && matchesTreaty;
    });
  }
}
