import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of, switchMap } from 'rxjs';

export interface ReinsurancePeriod {
  reinsurerName: string;
  treatyId: string;
  reinsuranceId?: string;
  periodType: 'Week' | 'Month';
  periodStartDate: string;
  periodEndDate: string;
}

export interface SummaryCashFlow {
  total: Record<string, number>;
  reinsured: Record<string, number>;
}

export interface PeriodDetail extends ReinsurancePeriod {
  policyNumbers: string[];
  transactions: PolicyTransactionRow[];
  summaryCashFlow: SummaryCashFlow;
  policyCashFlow?: Record<string, SummaryCashFlow>;
  policySummaries?: Record<string, PolicySummaryRow>;
}

export interface PolicySummaryRow {
  policyNumber: string;
  policyIssueDate: string;
  appSignDate: string;
  reinsuranceId: string;
  treatyId: string;
  reinsurerName: string;
  reinsuranceStartDate: string;
  reinsuranceEndDate: string;
  rateLockDate: string;
}

export interface PolicyTransactionRow {
  policyNumber: string;
  processDate: string;
  transactionType: string;
  amount: number;
  category?: string;
  partialSurrenderCharge?: number;
  surrenderCharge?: number;
  mvdAdjAmount?: number;
  feeAmount?: number;
  reversal?: string;
  deathClaimInterest?: number;
  deathClaimBenefitAmount?: number;
  commission?: number;
  reinsuredShare?: number;
}


@Injectable({ providedIn: 'root' })
export class PolicyDetailsService {
  // Dummy API base for future integration (currently unused; mock JSON is the source)
  private readonly apiBase = 'https://api.example.com/reinsurance';
  // Future endpoints (replace mocks with these URLs when backend is ready)
  private readonly searchPeriodsApi = `${this.apiBase}/policy-periods/search`;
  private readonly periodDetailApi = `${this.apiBase}/policy-periods/detail`;
  private readonly policyDetailApi = `${this.apiBase}/policy-periods/policy-detail`;

  // Mock data locations (current source of truth)
  private readonly periodsUrl = '/assets/mock-data/policy-periods.json';
  private readonly periodDetailUrl = '/assets/mock-data/policy-period-detail.json';
  private readonly policyDetailUrl = '/assets/mock-data/policy-detail.json';
  private periodsCache$?: Observable<ReinsurancePeriod[]>;

  constructor(private readonly http: HttpClient) {}

  // Load all periods (used to populate dropdown options)
  loadPeriods(): Observable<ReinsurancePeriod[]> {
    if (!this.periodsCache$) {
      const source$ = this.http.get<ReinsurancePeriod[]>(this.periodsUrl).pipe(
        catchError(() => of([] as ReinsurancePeriod[]))
      );
      this.periodsCache$ = source$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this.periodsCache$;
  }

  // Search periods using filters. Currently filters mock JSON; later replace with POST to this.searchPeriodsApi
  searchPeriods(filters: { reinsurer?: string; treatyId?: string; start?: string | null; end?: string | null }): Observable<ReinsurancePeriod[]> {
    const { reinsurer = '', treatyId = '', start, end } = filters || {};
    return this.loadPeriods().pipe(
      map(list => {
        const s = start || null;
        const e = end || null;
        const daysBetween = (a?: string | null, b?: string | null) => {
          if (!a || !b) return 0;
          const d1 = new Date(`${a}T00:00:00Z`).getTime();
          const d2 = new Date(`${b}T00:00:00Z`).getTime();
          return Math.max(0, Math.round((d2 - d1) / 86400000) + 1);
        };
        const isFullMonthRange = (a?: string | null, b?: string | null) => {
          if (!a || !b) return false;
          const startD = new Date(`${a}T00:00:00Z`);
          const endD = new Date(`${b}T00:00:00Z`);
          const isFirst = startD.getUTCDate() === 1;
          const lastDay = new Date(Date.UTC(endD.getUTCFullYear(), endD.getUTCMonth() + 1, 0)).getUTCDate();
          return isFirst && endD.getUTCDate() === lastDay && startD.getUTCFullYear() === endD.getUTCFullYear() && startD.getUTCMonth() === endD.getUTCMonth();
        };
        const includeMonth = !!(s && e && (daysBetween(s, e) > 7 || isFullMonthRange(s, e)));
        const base = list.filter(p => {
          const matchesReinsurer = !reinsurer || p.reinsurerName === reinsurer;
          const matchesTreaty = !treatyId || p.treatyId === treatyId;
          const within = (s && e) ? (p.periodStartDate >= s && p.periodEndDate <= e)
                        : (s ? p.periodStartDate >= s : (e ? p.periodEndDate <= e : true));
          const typeOk = p.periodType === 'Week' || (includeMonth && p.periodType === 'Month');
          return typeOk && within && matchesReinsurer && matchesTreaty;
        });
        if (s && e && !includeMonth) {
          const weeklyAtEnd = base.filter(p => p.periodType === 'Week' && p.periodEndDate === e);
          if (weeklyAtEnd.length) return weeklyAtEnd;
        }
        return base;
      }),
      catchError(() => of([] as ReinsurancePeriod[]))
    );
  }

  // Fetch the full detail for a period
  loadPeriodDetail(period: ReinsurancePeriod): Observable<PeriodDetail> {
    return this.http.get<{ details: PeriodDetail[] }>(this.periodDetailUrl).pipe(
      map(resp => {
        const list = resp?.details || [];
        const match: any = list.find(d =>
          d.reinsurerName === period.reinsurerName &&
          d.treatyId === period.treatyId &&
          d.periodStartDate === period.periodStartDate &&
          d.periodEndDate === period.periodEndDate &&
          d.periodType === period.periodType
        );
        if (match) {
          return {
            ...period,
            policyNumbers: match.policyNumbers || [],
            transactions: [],
            summaryCashFlow: match.summaryCashFlow || { total: {}, reinsured: {} },
            policyCashFlow: {},
            policySummaries: {} as any,
          } as PeriodDetail;
        }
        return { ...period, policyNumbers: [], transactions: [], summaryCashFlow: { total: {}, reinsured: {} }, policyCashFlow: {}, policySummaries: {} as any } as PeriodDetail;
      }),
      catchError(() => of({ ...period, policyNumbers: [], transactions: [], summaryCashFlow: { total: {}, reinsured: {} }, policyCashFlow: {}, policySummaries: {} as any } as PeriodDetail))
    );
  }

  // Search within a period by policy number and return a detail with transactions/cashflows filtered appropriately
  searchPolicyDetail(period: ReinsurancePeriod, policyNumber: string): Observable<PeriodDetail> {
    const pn = (policyNumber || '').trim();
    return this.http.get<{ items: any[] }>(this.policyDetailUrl).pipe(
      switchMap(resp => {
        const items = resp?.items || [];
        const match = items.find(i => i.reinsurerName === period.reinsurerName && i.treatyId === period.treatyId && i.periodType === period.periodType && i.periodStartDate === period.periodStartDate && i.periodEndDate === period.periodEndDate && i.policyNumber === pn);
        return this.loadPeriodDetail(period).pipe(
          map(detail => {
            if (!pn) return detail;
            const copy: PeriodDetail = { ...detail } as any;
            if (match && match.summaryCashFlow) {
              copy.summaryCashFlow = match.summaryCashFlow;
              copy.policyCashFlow = { ...(detail as any).policyCashFlow, [pn]: match.summaryCashFlow } as any;
            } else {
              const perPolicy = (detail as any).policyCashFlow?.[pn];
              if (perPolicy) copy.summaryCashFlow = perPolicy;
            }
            // Override transactions and policy summary if provided by combined mock
            if (match && Array.isArray(match.transactions)) {
              copy.transactions = match.transactions.filter((t: any) => !pn || t.policyNumber === pn);
            }
            if (match && match.policySummary) {
              (copy as any).policySummaries = { [pn]: match.policySummary } as any;
            }
            copy.policyNumbers = detail.policyNumbers?.includes(pn) ? [pn] : detail.policyNumbers || [];
            return copy;
          })
        );
      })
    );
  }
}
