import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay } from 'rxjs';
import { WeeklyBucket } from '../../reinsurance/reinsurance.types';
import { ReinsurerData } from '../../reinsurance/reinsurance.types';

interface FlatRecord extends ReinsurerData {}

export interface RatesDataPayload {
  rows: ReinsurerData[];
  weeklyBuckets: WeeklyBucket[];
  monthlyBuckets: WeeklyBucket[];
}

@Injectable({ providedIn: 'root' })
export class ReinsuranceRatesService {
  private readonly apiUrl = '/api/reinsurance/weekly';
  private readonly mockUrl = 'assets/mock-data/mock-reinsurance-details.json';
  private cache$?: Observable<RatesDataPayload>;

  constructor(private readonly http: HttpClient) {}

  load(): Observable<RatesDataPayload> {
    if (!this.cache$) {
      const source$ = isDevMode()
        ? this.http.get<FlatRecord[]>(this.mockUrl)
        : this.http.get<FlatRecord[]>(this.apiUrl).pipe(
            catchError((error) => {
              console.warn('[reinsurance-rates] falling back to mock data', error);
              return this.http.get<FlatRecord[]>(this.mockUrl);
            }),
          );

      this.cache$ = source$.pipe(
        map((records) => this.transform(records ?? [])),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  private transform(records: FlatRecord[]): RatesDataPayload {
    const rows = records.map(r => ({ ...r }));
    const weeklyBuckets = this.buildWeeklyBuckets(rows);
    const monthlyBuckets = this.buildMonthlyBuckets(rows);
    return { rows, weeklyBuckets, monthlyBuckets };
  }

  private buildWeeklyBuckets(rows: ReinsurerData[]): WeeklyBucket[] {
    const buckets = new Map<string, WeeklyBucket>();
    rows.forEach((row) => {
      const startIso = row.periodStartDate;
      const endIso = row.periodEndDate;
      const key = `${startIso}_${endIso}`;
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
      bucket.totalPremiums += row.premiums ?? 0;
      bucket.totalEndingAv += row.endingAv ?? 0;
    });
    return Array.from(buckets.values()).sort((a, b) => b.start.localeCompare(a.start));
  }

  private buildMonthlyBuckets(rows: ReinsurerData[]): WeeklyBucket[] {
    const buckets = new Map<string, WeeklyBucket>();
    rows.forEach((row) => {
      const startIso = row.periodStartDate;
      if (!startIso) return;
      const d = this.parseDate(startIso);
      if (!d) return;
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const monthStart = new Date(Date.UTC(y, m, 1));
      const monthEnd = new Date(Date.UTC(y, m + 1, 0));
      const start = this.toIsoDate(monthStart);
      const end = this.toIsoDate(monthEnd);
      const key = `${start}_${end}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          start,
          end,
          label: this.formatMonthLabel(start),
          totalPolicies: 0,
          totalPremiums: 0,
          totalEndingAv: 0,
        });
      }
      const bucket = buckets.get(key)!;
      bucket.totalPolicies += 1;
      bucket.totalPremiums += row.premiums ?? 0;
      bucket.totalEndingAv += row.endingAv ?? 0;
    });
    return Array.from(buckets.values()).sort((a, b) => b.start.localeCompare(a.start));
  }

  private parseDate(iso: string): Date | null {
    if (!iso) return null;
    const date = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatWeekLabel(startIso: string, endIso: string): string {
    const s = this.parseDate(startIso);
    const e = this.parseDate(endIso);
    if (!s || !e) return `${startIso} – ${endIso}`;
    const startLabel = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }

  private formatMonthLabel(startIso: string): string {
    const s = this.parseDate(startIso);
    return s ? s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : startIso;
  }
}
