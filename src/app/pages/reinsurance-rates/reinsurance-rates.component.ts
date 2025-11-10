import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { CardComponent, CardContentComponent } from '../../components/ui/card';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectPositionFixDirective } from '../../directives/mat-select-position-fix.directive';
import { ReinsuranceRatesService } from './services/reinsurance-rates.service';
import { ReinsurerData } from '../reinsurance/reinsurance.types';

@Component({
  selector: 'app-reinsurance-rates',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardComponent,
    CardContentComponent,
    ButtonComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectPositionFixDirective,
  ],
  templateUrl: './reinsurance-rates.component.html',
  styleUrls: ['./reinsurance-rates.component.scss'],
})
export class ReinsuranceRatesComponent implements OnInit {
  form: FormGroup;
  rows: ReinsurerData[] = [];
  private defaultStartDate: string | null = null;
  private defaultEndDate: string | null = null;
  private applied = { reinsurer: '', treatyId: '', start: null as string | null, end: null as string | null };

  // pagination
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50, 100];

  constructor(private readonly fb: FormBuilder, private readonly data: ReinsuranceRatesService) {
    this.form = this.fb.group({
      reinsurer: [''],
      treatyId: [''],
      startDate: [''],
      endDate: [''],
    });
    this.form.setValidators(this.validateDateRange.bind(this));
  }

  ngOnInit(): void {
    const range = this.getTwoMonthWindow();
    this.defaultStartDate = range.start;
    this.defaultEndDate = range.end;

    this.data.load().subscribe(({ rows }) => {
      this.rows = rows;
      this.form.patchValue({
        startDate: this.defaultStartDate ? new Date(this.defaultStartDate + 'T00:00:00Z') : '',
        endDate: this.defaultEndDate ? new Date(this.defaultEndDate + 'T00:00:00Z') : ''
      });
      this.form.updateValueAndValidity({ emitEvent: false });
      this.applied = { reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };
    });

    this.form.valueChanges.subscribe(() => {
      this.page = 1;
    });
  }


  get distinctReinsurers(): string[] {
    const set = new Set<string>();
    for (const r of this.rows) {
      if (r.reinsurerName) set.add(r.reinsurerName);
    }
    return Array.from(set.values());
  }

  get distinctTreatyIds(): string[] {
    const set = new Set<string>();
    for (const r of this.rows) {
      const t = (r.treatyId || '').trim();
      if (t) set.add(t);
    }
    return Array.from(set.values()).sort();
  }

  // filtering and pagination
  private isoFromForm(v: any): string | null {
    if (!v) return null;
    if (v instanceof Date) {
      const y = v.getFullYear();
      const m = String(v.getMonth() + 1).padStart(2, '0');
      const d = String(v.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof v === 'string') return v.slice(0, 10);
    return null;
  }

  get filteredRows(): ReinsurerData[] {
    const reinsurer = this.applied.reinsurer;
    const treatyId = this.applied.treatyId;
    const s = this.applied.start || this.defaultStartDate;
    const e = this.applied.end || this.defaultEndDate;

    const within = (row: ReinsurerData) => {
      if (!s && !e) return true;
      if (s && e) return row.periodStartDate >= s && row.periodEndDate <= e;
      if (s) return row.periodStartDate >= s;
      return row.periodEndDate <= e!;
    };

    const result = this.rows.filter((r) => {
      const matchesReinsurer = !reinsurer || r.reinsurerName === reinsurer;
      const matchesTreaty = !treatyId || r.treatyId === treatyId;
      return within(r) && matchesReinsurer && matchesTreaty;
    });

    const start = (this.page - 1) * this.pageSize;
    return result.slice(start, start + this.pageSize);
  }

  get totalFiltered(): number {
    const reinsurer = this.applied.reinsurer;
    const treatyId = this.applied.treatyId;
    const s = this.applied.start || this.defaultStartDate;
    const e = this.applied.end || this.defaultEndDate;
    const within = (row: ReinsurerData) => {
      if (!s && !e) return true;
      if (s && e) return row.periodStartDate >= s && row.periodEndDate <= e;
      if (s) return row.periodStartDate >= s;
      return row.periodEndDate <= e!;
    };
    return this.rows.filter((r) => {
      const matchesReinsurer = !reinsurer || r.reinsurerName === reinsurer;
      const matchesTreaty = !treatyId || r.treatyId === treatyId;
      return within(r) && matchesReinsurer && matchesTreaty;
    }).length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFiltered / this.pageSize));
  }

  nextPage(): void { if (this.page < this.totalPages) { this.page += 1; } }
  prevPage(): void { if (this.page > 1) { this.page -= 1; } }
  setPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.page = p; } }

  private allFilteredRows(): ReinsurerData[] {
    const reinsurer = this.applied.reinsurer;
    const treatyId = this.applied.treatyId;
    const s = this.applied.start || this.defaultStartDate;
    const e = this.applied.end || this.defaultEndDate;
    const within = (row: ReinsurerData) => {
      if (!s && !e) return true;
      if (s && e) return row.periodStartDate >= s && row.periodEndDate <= e;
      if (s) return row.periodStartDate >= s;
      return row.periodEndDate <= e!;
    };
    return this.rows.filter((r) => {
      const matchesReinsurer = !reinsurer || r.reinsurerName === reinsurer;
      const matchesTreaty = !treatyId || r.treatyId === treatyId;
      return within(r) && matchesReinsurer && matchesTreaty;
    });
  }

  exportCurrentView(): void {
    const rows = this.allFilteredRows();
    if (!rows.length) return;
    const header = [
      'reinsurerId','reinsurerName','treatyId','quotaShare','cedingAllowancePrem','cedingAllowanceAv','expenseAllowanceComm','expenseAllowancePrem','moneyType','channel','issueStateCode','productName','productCode','tenor','periodStartDate','periodEndDate'
    ];
    const csv = [header.join(',')].concat(
      rows.map(r => [
        r.reinsurerId,
        r.reinsurerName,
        r.treatyId,
        r.quotaShare ?? '',
        r.cedingAllowancePrem ?? '',
        r.cedingAllowanceAv ?? '',
        r.expenseAllowanceComm ?? '',
        r.expenseAllowancePrem ?? '',
        r.moneyType ?? '',
        r.channel ?? '',
        r.issueStateCode ?? '',
        r.productName,
        r.productCode ?? '',
        r.tenor ?? '',
        r.periodStartDate,
        r.periodEndDate,
      ].map(v => typeof v === 'string' ? '"' + v.replaceAll('"','""') + '"' : String(v)).join(','))
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reinsurance-rates-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
  }

  hasActiveFilters(): boolean {
    const reinsurer = this.applied.reinsurer || '';
    const treatyId = this.applied.treatyId || '';
    const s = this.applied.start;
    const e = this.applied.end;
    const changedReinsurer = reinsurer !== '';
    const changedTreaty = treatyId !== '';
    const changedStart = s !== (this.defaultStartDate || null);
    const changedEnd = e !== (this.defaultEndDate || null);
    return changedReinsurer || changedTreaty || changedStart || changedEnd;
  }

  clearFilters(): void {
    this.form.patchValue({
      reinsurer: '',
      treatyId: '',
      startDate: this.defaultStartDate ? new Date(this.defaultStartDate + 'T00:00:00Z') : '',
      endDate: this.defaultEndDate ? new Date(this.defaultEndDate + 'T00:00:00Z') : ''
    });
    this.applied = { reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };
    this.page = 1;
  }

  private getTwoMonthWindow(): { start: string; end: string } {
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = todayUtc.getUTCDay();
    const daysSinceMonday = (day + 6) % 7; // Monday=0, Sunday=6
    const startOfCurrentWeek = new Date(todayUtc);
    startOfCurrentWeek.setUTCDate(startOfCurrentWeek.getUTCDate() - daysSinceMonday);
    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setUTCDate(startOfPreviousWeek.getUTCDate() - 7);
    const endOfPreviousWeek = new Date(startOfPreviousWeek);
    endOfPreviousWeek.setUTCDate(endOfPreviousWeek.getUTCDate() + 6);
    return { start: startOfPreviousWeek.toISOString().slice(0, 10), end: endOfPreviousWeek.toISOString().slice(0, 10) };
  }

  onSearch(): void {
    if (this.form.invalid) return;
    const { reinsurer, treatyId, startDate, endDate } = this.form.value as any;
    this.applied = {
      reinsurer: reinsurer || '',
      treatyId: treatyId || '',
      start: this.isoFromForm(startDate),
      end: this.isoFromForm(endDate),
    };
    this.page = 1;
  }

  formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    const normalized = Math.abs(value) > 1 ? value : value * 100;
    return `${normalized.toFixed(2)}%`;
  }

  private normalizeLocalDate(value: any): Date | null {
    if (!value) return null;
    const d = value instanceof Date ? value : (typeof value === 'string' ? new Date(value) : null);
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private validateDateRange(group: AbstractControl): ValidationErrors | null {
    const start = this.normalizeLocalDate(group.get('startDate')?.value);
    const end = this.normalizeLocalDate(group.get('endDate')?.value);
    const sCtrl = group.get('startDate');
    const eCtrl = group.get('endDate');
    if (sCtrl?.hasError('dateRange')) {
      const { dateRange, ...rest } = sCtrl.errors as any;
      sCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    if (eCtrl?.hasError('dateRange')) {
      const { dateRange, ...rest } = eCtrl.errors as any;
      eCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    if (start && end && start.getTime() > end.getTime()) {
      sCtrl?.setErrors({ ...(sCtrl.errors || {}), dateRange: true });
      eCtrl?.setErrors({ ...(eCtrl.errors || {}), dateRange: true });
      return { startAfterEnd: true };
    }
    return null;
  }

  formatPeriod(start: string, end: string): string {
    if (!start || !end) return '';
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} – ${e}`;
  }
}
