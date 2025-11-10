import { Component, OnInit } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CardComponent, CardContentComponent } from '../../components/ui/card';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { MatSelectPositionFixDirective } from '../../directives/mat-select-position-fix.directive';
import { PolicyDetailsService, ReinsurancePeriod, PolicySummaryRow, PolicyTransactionRow, PeriodDetail } from './services/policy-details.service';
import { PolicyDetailsLookupService } from './services/policy-details-lookup.service';

@Component({
  selector: 'app-policy-details',
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
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss'],
})
export class PolicyDetailsComponent implements OnInit {
  form: FormGroup;
  periods: ReinsurancePeriod[] = [];
  displayedPeriods: ReinsurancePeriod[] = [];
  reinsurers: string[] = [];
  treatyIds: string[] = [];
  selectedPolicyNumber: string = '';
  selectedPeriod: PeriodDetail | null = null;
  private defaultStartDate: string | null = null;
  private defaultEndDate: string | null = null;
  private applied = { reinsurer: '', treatyId: '', start: null as string | null, end: null as string | null };

  // pagination
  page = 1;
  pageSize = 5;
  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  // Summary Transaction Details pagination
  transPage = 1;
  transPageSize = 5;
  readonly transPageSizeOptions = [5, 10, 25, 50, 100];

  private enterGuard: MatSelect | null = null;

  constructor(private readonly fb: FormBuilder, private readonly data: PolicyDetailsService, private readonly lookups: PolicyDetailsLookupService) {
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

    this.data.loadPeriods().subscribe((periods) => {
      this.periods = periods;
      this.form.patchValue({ startDate: this.defaultStartDate ? new Date(this.defaultStartDate + 'T00:00:00Z') : '', endDate: this.defaultEndDate ? new Date(this.defaultEndDate + 'T00:00:00Z') : '' });
      this.form.updateValueAndValidity({ emitEvent: false });
      this.applied = { reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };
      this.data.searchPeriods(this.applied).subscribe(rows => this.displayedPeriods = rows);
    });

    // Load lookup dropdowns
    this.lookups.getReinsurers().subscribe(list => this.reinsurers = list);
    this.lookups.getTreatyIds().subscribe(list => this.treatyIds = list);

    this.form.valueChanges.subscribe(() => {
      this.page = 1;
      this.selectedPeriod = null;
      this.selectedPolicyNumber = '';
      this.transPage = 1;
    });
  }


  getReinsurerNaic(reinsurer: string): string {
    const entry = this.periods.find(p => p.reinsurerName === reinsurer && (p.reinsuranceId || '').toString().trim().length > 0);
    return entry ? (entry.reinsuranceId as string).trim() : '—';
  }

  get minDate(): string | null {
    if (this.defaultStartDate) return this.defaultStartDate;
    if (!this.periods.length) return null;
    const min = this.periods.reduce((acc, p) => (p.periodStartDate < acc ? p.periodStartDate : acc), this.periods[0].periodStartDate);
    return min;
  }

  get maxDate(): string | null {
    if (this.defaultEndDate) return this.defaultEndDate;
    if (!this.periods.length) return null;
    const max = this.periods.reduce((acc, p) => (p.periodEndDate > acc ? p.periodEndDate : acc), this.periods[0].periodEndDate);
    return max;
  }

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

  get filtered(): ReinsurancePeriod[] {
    const start = (this.page - 1) * this.pageSize;
    return this.displayedPeriods.slice(start, start + this.pageSize);
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
    this.selectedPeriod = null;
    this.selectedPolicyNumber = '';
    this.page = 1;
    this.transPage = 1;
    // Re-fetch default grid data
    this.data.searchPeriods(this.applied).subscribe(rows => this.displayedPeriods = rows);
  }

  get totalFiltered(): number { return this.displayedPeriods.length; }

  get totalPages(): number { return Math.max(1, Math.ceil(this.totalFiltered / this.pageSize)); }
  nextPage(): void { if (this.page < this.totalPages) this.page += 1; }
  prevPage(): void { if (this.page > 1) this.page -= 1; }
  setPageSize(size: number): void { this.pageSize = size; this.page = 1; }

  get rangeStart(): string | null { return this.applied.start || this.defaultStartDate; }
  get rangeEnd(): string | null { return this.applied.end || this.defaultEndDate; }

  // Compute the policy numbers in current filters/range
  get summaryStart(): string | null { return this.selectedPeriod?.periodStartDate || null; }
  get summaryEnd(): string | null { return this.selectedPeriod?.periodEndDate || null; }

  get policyNumbersInRange(): string[] {
    if (!this.selectedPeriod) return [];
    return (this.selectedPeriod.policyNumbers || []).slice();
  }

  get hasPolicyMatch(): boolean {
    if (!this.selectedPolicyNumber) return true;
    const list = this.policyNumbersInRange;
    return list.includes(this.selectedPolicyNumber);
  }

  get selectedPolicy(): PolicySummaryRow | null {
    if (!this.selectedPolicyNumber) return null;
    const period: any = this.selectedPeriod;
    const fromPeriod = period?.policySummaries?.[this.selectedPolicyNumber];
    if (fromPeriod) return fromPeriod as PolicySummaryRow;
    if (!period) return null;
    const inRange = (period.policyNumbers || []).includes(this.selectedPolicyNumber);
    if (!inRange) return null;
    return {
      policyNumber: this.selectedPolicyNumber,
      policyIssueDate: '',
      appSignDate: '',
      reinsuranceId: (period.reinsuranceId || '').toString(),
      treatyId: period.treatyId,
      reinsurerName: period.reinsurerName,
      reinsuranceStartDate: period.periodStartDate,
      reinsuranceEndDate: period.periodEndDate,
      rateLockDate: '',
    } as PolicySummaryRow;
  }

  // Transactions filtered by selected policy (or All) and current filters/range
  get policyTransactions(): PolicyTransactionRow[] {
    if (!this.selectedPeriod) return [];
    const list = this.selectedPeriod.transactions || [];
    if (this.selectedPolicyNumber) return list.filter(t => t.policyNumber === this.selectedPolicyNumber);
    return list;
  }

  get pagedPolicyTransactions(): PolicyTransactionRow[] {
    const start = (this.transPage - 1) * this.transPageSize;
    return this.policyTransactions.slice(start, start + this.transPageSize);
  }

  get transTotalPages(): number { return Math.max(1, Math.ceil(this.policyTransactions.length / this.transPageSize)); }
  transNextPage(): void { if (this.transPage < this.transTotalPages) this.transPage += 1; }
  transPrevPage(): void { if (this.transPage > 1) this.transPage -= 1; }
  setTransPageSize(size: number): void { this.transPageSize = size; this.transPage = 1; }

  onSearch(): void {
    if (this.form.invalid) return;
    const { reinsurer, treatyId, startDate, endDate } = this.form.value as any;
    const sIso = this.isoFromForm(startDate);
    let eIso = this.isoFromForm(endDate);

    // If user changed start but left end at the default, treat end as open (use maxDate)
    if (sIso && eIso && this.defaultStartDate && this.defaultEndDate && sIso !== this.defaultStartDate && eIso === this.defaultEndDate) {
      eIso = null;
    }

    this.applied = { reinsurer: reinsurer || '', treatyId: treatyId || '', start: sIso, end: eIso };
    this.page = 1;
    this.selectedPeriod = null;
    this.selectedPolicyNumber = '';
    this.transPage = 1;

    this.data.searchPeriods(this.applied).subscribe(rows => this.displayedPeriods = rows);
  }

  onFormEnter(event: Event): void {
    // Prevent Enter applying filters when a dropdown or datepicker is open
    const hasOpenSelect = typeof document !== 'undefined' && !!document.querySelector('.mat-mdc-select-panel');
    const hasOpenDate = typeof document !== 'undefined' && !!document.querySelector('.mat-datepicker-content');
    if (hasOpenSelect || hasOpenDate) return;
    event.preventDefault();
    (event as any).stopPropagation?.();
    // Blur focused control (e.g., mat-select trigger) to avoid it toggling open
    try {
      const active = document.activeElement as HTMLElement | null;
      active?.blur?.();
    } catch {}
    this.onSearch();
  }


  onSelectEnterFrom(select: MatSelect, event: Event): void {
    if (!select) return;
    if (select.panelOpen) return;
    this.enterGuard = select;
    event.preventDefault();
    (event as any).stopPropagation?.();
    try { select.close(); } catch {}
    setTimeout(() => {
      if (!select.panelOpen && this.enterGuard === select) {
        this.blurActive();
        this.onSearch();
        this.enterGuard = null;
      }
    }, 30);
  }

  onSelectEnterUp(select: MatSelect, event: Event): void {
    if (!select || select.panelOpen) return;
    event.preventDefault();
    (event as any).stopPropagation?.();
  }

  onViewPeriod(p: ReinsurancePeriod): void {
    this.data.loadPeriodDetail(p).subscribe(detail => {
      this.selectedPeriod = detail;
      this.selectedPolicyNumber = '';
      this.transPage = 1;
    });
  }

  onPolicyNumberChange(value: string): void {
    this.selectedPolicyNumber = value || '';
    this.transPage = 1;
  }

  onPolicySearch(value: string): void {
    const v = (value || '').trim();
    this.selectedPolicyNumber = v;
    this.transPage = 1;
    if (this.selectedPeriod) {
      this.data.searchPolicyDetail(this.selectedPeriod, v).subscribe((detail) => {
        this.selectedPeriod = detail;
      });
    }
  }

  onSelectOpenedChange(select: MatSelect, opened: boolean): void {
    if (opened && this.enterGuard === select) {
      try { select.close(); } catch {}
      setTimeout(() => {
        this.blurActive();
        this.onSearch();
        this.enterGuard = null;
      });
    }
  }

  private blurActive(): void {
    try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
  }

  onPolicyClear(input: HTMLInputElement): void {
    if (input) input.value = '';
    this.selectedPolicyNumber = '';
    this.transPage = 1;
  }

  isRowSelected(p: ReinsurancePeriod): boolean {
    if (!this.selectedPeriod) return false;
    return (
      this.selectedPeriod.reinsurerName === p.reinsurerName &&
      this.selectedPeriod.treatyId === p.treatyId &&
      this.selectedPeriod.periodStartDate === p.periodStartDate &&
      this.selectedPeriod.periodEndDate === p.periodEndDate
    );
  }

  cashFlowTotals(): { total: Record<string, number>; reinsured: Record<string, number> } {
    const period: any = this.selectedPeriod;
    if (!period) return { total: {}, reinsured: {} } as any;
    if (!this.selectedPolicyNumber) return period.summaryCashFlow || ({ total: {}, reinsured: {} } as any);
    const perPolicy = period.policyCashFlow?.[this.selectedPolicyNumber];
    return perPolicy || ({ total: {}, reinsured: {} } as any);
  }


  formatCurrency(n: number): string { return `$${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`; }
  formatPercent(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    const normalized = Math.abs(v) > 1 ? v : v * 100;
    return `${normalized.toFixed(2)}%`;
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
    return { start: this.toIso(startOfPreviousWeek), end: this.toIso(endOfPreviousWeek) };
  }

  private toIso(d: Date): string { return d.toISOString().slice(0, 10); }

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
}
