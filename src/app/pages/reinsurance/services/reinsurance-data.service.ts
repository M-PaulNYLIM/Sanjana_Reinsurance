import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { Observable, catchError, map, shareReplay } from 'rxjs';
import { PolicyData, ReinsurerData, WeeklyBucket } from '../reinsurance.types';

type MetricKeys =
  | 'quotaShare'
  | 'cedingAllowancePrem'
  | 'cedingAllowanceAv'
  | 'expenseAllowancePrem'
  | 'expenseAllowanceComm'
  | 'premiums'
  | 'endingAv'
  | 'reEndingAv'
  | 'partialSurrender'
  | 'surrender'
  | 'annuitization'
  | 'death'
  | 'transfers'
  | 'fees'
  | 'commissionAmt';

type ReinsuranceFlatRecord = Omit<ReinsurerData, MetricKeys> &
  { [K in MetricKeys]: number | null | undefined } &
  { weekKey?: string };

export interface ReinsuranceDataPayload {
  treaties: ReinsurerData[];
  policies: PolicyData[];
  weeklyBuckets: WeeklyBucket[];
}

@Injectable({ providedIn: 'root' })
export class ReinsuranceDataService {
  private readonly apiUrl = '/api/reinsurance/weekly';
  private readonly mockUrl = '/assets/mock-data/mock-reinsurance-details.json';
  private cache$?: Observable<ReinsuranceDataPayload>;

  constructor(private readonly http: HttpClient) {}

  load(): Observable<ReinsuranceDataPayload> {
    if (!this.cache$) {
      const source$ = isDevMode()
        ? this.http.get<ReinsuranceFlatRecord[]>(this.mockUrl)
        : this.http.get<ReinsuranceFlatRecord[]>(this.apiUrl).pipe(
            catchError((error) => {
              console.warn('[reinsurance] falling back to mock data', error);
              return this.http.get<ReinsuranceFlatRecord[]>(this.mockUrl);
            }),
          );

      this.cache$ = source$.pipe(
        map((records) => this.transform(records ?? [])),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  private transform(records: ReinsuranceFlatRecord[]): ReinsuranceDataPayload {
    const treaties = records.map((record) => this.toTreaty(record));
    const policies: PolicyData[] = treaties.map((treaty) => ({
      policyNumber: treaty.policyNumber,
      productName: treaty.productName,
      issueStateCode: treaty.issueStateCode,
      endingAv: treaty.endingAv ?? 0,
      premiums: treaty.premiums ?? 0,
      reinsurerId: treaty.reinsurerId,
      reinsurerName: treaty.reinsurerName,
      periodStartDate: treaty.periodStartDate,
      periodEndDate: treaty.periodEndDate,
    }));

    const weeklyBuckets = this.buildWeeklyBuckets(records, treaties);

    return { treaties, policies, weeklyBuckets };
  }

  private toTreaty(record: ReinsuranceFlatRecord): ReinsurerData {
    return {
      reinsurerId: (record.reinsurerId || '').trim(),
      reinsurerName: (record.reinsurerName || '').trim(),
      treatyId: (record.treatyId || '').trim(),
      quotaShare: this.toNumber(record.quotaShare),
      cedingAllowancePrem: this.toNumber(record.cedingAllowancePrem),
      cedingAllowanceAv: this.toNumber(record.cedingAllowanceAv),
      expenseAllowancePrem: this.toNumber(record.expenseAllowancePrem),
      expenseAllowanceComm: this.toNumber(record.expenseAllowanceComm),
      periodStartDate: record.periodStartDate,
      periodEndDate: record.periodEndDate,
      policyNumber: record.policyNumber,
      productName: record.productName,
      productCode: record.productCode,
      issueStateCode: record.issueStateCode,
      premiums: this.toNumber(record.premiums),
      endingAv: this.toNumber(record.endingAv),
      reEndingAv: this.toNumber(record.reEndingAv),
      partialSurrender: this.toNumber(record.partialSurrender),
      surrender: this.toNumber(record.surrender),
      annuitization: this.toNumber(record.annuitization),
      death: this.toNumber(record.death),
      transfers: this.toNumber(record.transfers),
      fees: this.toNumber(record.fees),
      commissionAmt: this.toNumber(record.commissionAmt),
      tenor: record.tenor,
      moneyType: record.moneyType,
      channel: record.channel,
    };
  }

  private buildWeeklyBuckets(
    records: ReinsuranceFlatRecord[],
    treaties: ReinsurerData[],
  ): WeeklyBucket[] {
    const buckets = new Map<string, WeeklyBucket>();

    treaties.forEach((treaty, index) => {
      const startIso = treaty.periodStartDate;
      const endIso = treaty.periodEndDate;
      const key = records[index]?.weekKey || `${startIso}_${endIso}`;

      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          start: startIso,
          end: endIso,
          label: this.formatWeekLabel(startIso, endIso),
          totalPolicies: 0,
          totalPremiums: 0,
          totalEndingAv: 0,
        });
      }

      const bucket = buckets.get(key)!;
      bucket.totalPolicies += 1;
      bucket.totalPremiums += treaty.premiums ?? 0;
      bucket.totalEndingAv += treaty.endingAv ?? 0;
    });

    return Array.from(buckets.values()).sort((a, b) => b.start.localeCompare(a.start));
  }

  private toNumber(value: number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private parseDate(iso: string): Date | null {
    if (!iso) {
      return null;
    }
    const date = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatWeekLabel(startIso: string, endIso: string): string {
    const startDate = this.parseDate(startIso);
    const endDate = this.parseDate(endIso);
    if (!startDate || !endDate) {
      return `${startIso} – ${endIso}`;
    }
    const startLabel = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endLabel = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startLabel} – ${endLabel}`;
  }
}
