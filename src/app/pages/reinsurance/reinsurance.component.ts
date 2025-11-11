import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';
// UI Components
import { ButtonComponent } from '../../components/ui/button/button.component';
import { TreatyGridComponent } from './components/treaty-grid/treaty-grid.component';
import { InputComponent } from '../../components/ui/input/input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectPositionFixDirective } from '../../directives/mat-select-position-fix.directive';
import { CardComponent, CardContentComponent } from '../../components/ui/card';
import { TabsComponent, TabsContentComponent } from '../../components/ui/tabs';
import {
    ReinsurerData,
    ProductPeriod,
} from './reinsurance.types';
import { PolicyDetailsService, ReinsurancePeriod } from '../policy-details/services/policy-details.service';
import { ReinsuranceTreatiesService } from './services/reinsurance-treaties.service';
import { ReinsuranceLookupService } from './services/reinsurance-lookup.service';
import { Subject, forkJoin } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { ReinsurancePeriodsService } from './services/reinsurance-periods.service';
import * as XLSX from 'xlsx-js-style';
@Component({
    selector: 'app-reinsurance',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonComponent,
        InputComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectPositionFixDirective,
        CardComponent,
        CardContentComponent,
        TabsComponent,
        TabsContentComponent,
        TreatyGridComponent,
    ],
    templateUrl: "./reinsurance.component.html",
    styleUrls: ["./reinsurance.component.scss"]
})
export class ReinsuranceComponent implements OnInit, OnDestroy {
    activeTab: string = 'reinsurer';
    reinsurerData: ReinsurerData[] = [];
    weeklyBuckets: any[] = [];
    private monthlyBuckets: any[] = [];
    private monthlyBucketIndex = new Map<string, { start: string; end: string }>();
    private weeklyBucketIndex = new Map<string, {
        start: string;
        end: string;
    }>();
    private defaultEffectivePeriodKey: string | null = null;
    private defaultStartDate: string | null = null;
    private defaultEndDate: string | null = null;
    editingTreaty: ReinsurerData | null = null;
    editForm: FormGroup | null = null;
    // Reinsurer filters
    readonly reinsurerFiltersForm: FormGroup;
    dateFrom: string = '';
    dateTo: string = '';
    // Dropdown options from API/lookup service
    reinsurerOptions: string[] = [];
    treatyIdOptions: string[] = [];
    private appliedFilters: { search: string; reinsurer: string; treatyId: string; start: string | null; end: string | null } = {
        search: '', reinsurer: '', treatyId: '', start: null, end: null
    };
    private treatyFilter: { reinsurer: string; treatyId: string; start: string | null; end: string | null } = {
        reinsurer: '', treatyId: '', start: null, end: null
    };
    // groupBy removed per requirements
    selectedTreaty: ReinsurerData | null = null;
    selectedPeriod: ProductPeriod | null = null;
    // Periods data (from policy-periods.json)
    periods: ReinsurancePeriod[] = [];
    selectedPeriodRow: ReinsurancePeriod | null = null;
    // Reinsurance Periods grid pagination
    periodsPage = 1;
    periodsPageSize = 5;
    readonly periodsPageSizeOptions = [5, 10, 25, 50, 100];
    // Treaties bound to grid (API-driven when a period is selected)
    gridTreaties: ReinsurerData[] = [];
    @ViewChild('detailPanelRef') detailPanelRef?: ElementRef<HTMLElement>;
    private readonly destroy$ = new Subject<void>();

    get latestWeekKey(): string | null {
        return null;
    }

constructor(private router: Router, private fb: FormBuilder, private policyService: PolicyDetailsService, private lookup: ReinsuranceLookupService, private periodsApi: ReinsurancePeriodsService, private treatiesApi: ReinsuranceTreatiesService) {
        this.reinsurerFiltersForm = this.fb.group({
            search: [''],
            reinsurer: [''],
            treatyId: [''],
            startDate: [''],
            endDate: [''],
        });
        this.reinsurerFiltersForm.setValidators(this.validateDateRange.bind(this));
    }
    ngOnInit() {
        this.reinsurerFiltersForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.onReinsurerFiltersChanged());

        // Set default date window (previous week Mon–Sun)
        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const startOfCurrentWeek = this.startOfWeek(todayUtc);
        const startUtc = new Date(startOfCurrentWeek);
        startUtc.setUTCDate(startUtc.getUTCDate() - 7);
        const endUtc = this.endOfWeek(startUtc);
        const startLocal = new Date(startUtc.getUTCFullYear(), startUtc.getUTCMonth(), startUtc.getUTCDate());
        const endLocal = new Date(endUtc.getUTCFullYear(), endUtc.getUTCMonth(), endUtc.getUTCDate());
        this.defaultStartDate = this.toLocalIso(startLocal)!;
        this.defaultEndDate = this.toLocalIso(endLocal)!;
        this.reinsurerFiltersForm.patchValue({ startDate: startLocal, endDate: endLocal }, { emitEvent: false });
        this.reinsurerFiltersForm.updateValueAndValidity({ emitEvent: false });
        this.appliedFilters = { search: '', reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };
        this.treatyFilter = { reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };

        // Load dropdowns and initial treaties list (dev uses mock assets)
        forkJoin({
            periods: this.periodsApi.search({
            reinsurerName:null,
            reinsurerId:  null,
            treatyId:null,
            start:this.defaultStartDate,
            end:this.defaultEndDate,
        }),
            reinsurers: this.lookup.getReinsurersTreatyDropdown(),
            // treatyIds: this.lookup.getTreatyIds(),
            // treaties: this.treatiesApi.search({ reinsurerName: null, treatyId: null, start: null, end: null })
        })
            .pipe(take(1))
            .subscribe({
                next: ({ periods, reinsurers }: any) => {
                    this.periods = periods || [];
                    this.reinsurerOptions = reinsurers?.reinsurerDetails || [];
                    console.log('reinsurerOptions:', reinsurers,this.reinsurerOptions);
                    this.treatyIdOptions = reinsurers?.treatyID || [];
                    console.log('treatyIdOptions:', this.treatyIdOptions);
                    // this.reinsurerData = treaties || [];
                },
                error: (err) => {   
                    console.log(err)
                    this.reinsurerData = [];
                    this.updateEffectivePeriodDefault();
                },
            });
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    navigateToHome() {
        this.router.navigate(['/']);
    }
    setActiveTab(tab: string) {
        this.activeTab = tab;
    }
    viewTreatyDetails(treaty: ReinsurerData) {
        this.selectedTreaty = treaty;
        this.selectedPeriod = null;
 // Reset to simple view when opening modal
        this.editingTreaty = null;
        this.editForm = null;
        this.queueDetailPanelScroll();
    }
    openTreatyPanel(payload: { treaty: ReinsurerData; period: ProductPeriod | null }) {
        this.selectedTreaty = payload.treaty;
        this.selectedPeriod = payload.period ?? null;

        this.editingTreaty = null;
        this.editForm = null;
        this.queueDetailPanelScroll();
    }
    onViewTreaty(row: ReinsurerData): void {
        this.viewTreatyDetails(row);
    }
    onViewPeriod(p: ReinsurancePeriod): void {
        // Fetch treaties for the selected period via API (mock fallback)
        this.selectedPeriodRow = p;
        this.selectedTreaty = null;
        this.selectedPeriod = null;
        const start = (p.periodStartDate || '').slice(0, 10) || null;
        const end = (p.periodEndDate || '').slice(0, 10) || null;
        this.treatiesApi.search({
            reinsurerName: p.reinsurerName || '',
            treatyId: p.treatyId || '',
            start,
            end,
        }).pipe(take(1)).subscribe(rows => {
            this.gridTreaties = rows || [];
        });
    }
    closeTreatyPanel() {
        this.selectedTreaty = null;
        this.selectedPeriod = null;

        this.editingTreaty = null;
        this.editForm = null;
    }
    private onReinsurerFiltersChanged(): void {
        // Only affect the periods section when filters change; do not touch treaty grid
        this.periodsPage = 1;
    }

    onReinsFormEnter(event: Event): void {
        const hasOpenSelect = typeof document !== 'undefined' && !!document.querySelector('.mat-mdc-select-panel');
        const hasOpenDate = typeof document !== 'undefined' && !!document.querySelector('.mat-datepicker-content');
        if (hasOpenSelect || hasOpenDate) return;
        event.preventDefault?.();
        (event as any).stopPropagation?.();
        try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
        this.applyReinsurerFilters();
    }

    onReinsSelectEnterFrom(select: MatSelect, event: Event): void {
        if (select?.panelOpen) return;
        event.preventDefault?.();
        (event as any).stopPropagation?.();
        try { select?.close(); } catch {}
        try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
        this.applyReinsurerFilters();
    }

    onReinsSelectEnterUp(select: MatSelect, event: Event): void {
        if (select?.panelOpen) return;
        event.preventDefault?.();
        (event as any).stopPropagation?.();
        try { select?.close(); } catch {}
        try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
        this.applyReinsurerFilters();
    }
    startTreatyEdit(treaty: ReinsurerData, period: ProductPeriod, event?: Event) {
        this.selectedPeriod = period;
        if (!this.isLatestWeekPeriod(period)) {
            return;
        }
        event?.stopPropagation();
        this.selectedTreaty = treaty;

        this.editingTreaty = treaty;
        this.editForm = this.fb.group({
            reinsurerId: [(treaty.reinsurerId || '').trim()],
            reinsurerName: [(treaty.reinsurerName || '').trim()],
            treatyId: [(treaty.treatyId || '').trim()],
            quotaShare: [this.toEditableNumber(treaty.quotaShare)],
            cedingAllowancePrem: [this.toEditableNumber(treaty.cedingAllowancePrem)],
            cedingAllowanceAv: [this.toEditableNumber(treaty.cedingAllowanceAv)],
            expenseAllowanceComm: [this.toEditableNumber(treaty.expenseAllowanceComm)],
            expenseAllowancePrem: [this.toEditableNumber(treaty.expenseAllowancePrem)],
            moneyType: [(treaty.moneyType || '').trim()],
            channel: [(treaty.channel || '').trim()],
            issueStateCode: [(treaty.issueStateCode || '').trim()],
            productName: [(treaty.productName || '').trim()],
            productCode: [(treaty.productCode || '').trim()],
            tenor: [(treaty.tenor || '').trim()],
        });
        this.queueDetailPanelScroll();
    }
    cancelTreatyEdit(): void {
        this.closeTreatyPanel();
    }
    openSelectedTreatyEdit(): void {
        if (!this.selectedTreaty || !this.selectedPeriod) {
            return;
        }
        if (!this.isLatestWeekPeriod(this.selectedPeriod)) {
            return;
        }
        this.startTreatyEdit(this.selectedTreaty, this.selectedPeriod);
    }
    saveTreatyEdit(): void {
        if (!this.editingTreaty || !this.editForm) {
            return;
        }
        const formValue = this.editForm.getRawValue() as {
            reinsurerId: string;
            reinsurerName: string;
            treatyId: string;
            quotaShare: string;
            cedingAllowancePrem: string;
            cedingAllowanceAv: string;
            expenseAllowanceComm: string;
            expenseAllowancePrem: string;
            moneyType: string;
            channel: string;
            issueStateCode: string;
            productName: string;
            productCode: string;
            tenor: string;
        };
        const parsePercent = (value: string, fallback: number): number => {
            const trimmed = (value ?? '').trim();
            if (!trimmed) {
                return fallback;
            }
            const numeric = Number(trimmed);
            if (!Number.isFinite(numeric)) {
                return fallback;
            }
            return Math.max(0, Math.min(100, numeric));
        };
        const target = this.editingTreaty;
        target.reinsurerId = (formValue.reinsurerId || '').trim();
        target.reinsurerName = (formValue.reinsurerName || '').trim();
        target.treatyId = (formValue.treatyId || '').trim();
        target.quotaShare = parsePercent(formValue.quotaShare, target.quotaShare ?? 0);
        target.cedingAllowancePrem = parsePercent(formValue.cedingAllowancePrem, target.cedingAllowancePrem ?? 0);
        target.cedingAllowanceAv = parsePercent(formValue.cedingAllowanceAv, target.cedingAllowanceAv ?? 0);
        target.expenseAllowanceComm = parsePercent(formValue.expenseAllowanceComm, target.expenseAllowanceComm ?? 0);
        target.expenseAllowancePrem = parsePercent(formValue.expenseAllowancePrem, target.expenseAllowancePrem ?? 0);
        target.moneyType = (formValue.moneyType || '').trim();
        target.channel = (formValue.channel || '').trim();
        target.issueStateCode = (formValue.issueStateCode || '').trim();
        target.productName = (formValue.productName || '').trim();
        target.productCode = (formValue.productCode || '').trim();
        target.tenor = (formValue.tenor || '').trim();
        this.editingTreaty = null;
        this.editForm = null;
    }
    private queueDetailPanelScroll(): void {
        if (typeof window === 'undefined') {
            return;
        }
        requestAnimationFrame(() => {
            const element = this.detailPanelRef?.nativeElement;
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    clearReinsurerFilters(): void {
        this.reinsurerFiltersForm.patchValue({
            search: '',
            reinsurer: '',
            treatyId: '',
            startDate: this.defaultStartDate ? this.dateFromIsoLocal(this.defaultStartDate)! : '',
            endDate: this.defaultEndDate ? this.dateFromIsoLocal(this.defaultEndDate)! : ''
        });
        this.appliedFilters = { search: '', reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };
        // Clear selected period and treaty grid visibility
        this.selectedPeriodRow = null;
        this.selectedTreaty = null;
        this.selectedPeriod = null;
        this.gridTreaties = [];
        // Reset treaty grid filters
        this.treatyFilter = { reinsurer: '', treatyId: '', start: this.defaultStartDate, end: this.defaultEndDate };
        this.reinsurerFiltersForm.updateValueAndValidity();
        // Reload periods for default window so grid shows data
        this.periodsApi.search({
            reinsurerName: '',
            reinsurerId: null,
            treatyId: null,
            start: this.defaultStartDate,
            end: this.defaultEndDate,
        }).pipe(take(1)).subscribe(periods => {
            this.periods = periods || [];
        });
    }
    private computeWeeklyBuckets(): void {
        this.weeklyBucketIndex.clear();
        this.weeklyBuckets = [];
    }
    private getLatestWeekKey(): string | null {
        return null;
    }
    private getLatestMonthKey(): string | null {
        return null;
    }
    private updateEffectivePeriodDefault(): void { /* no-op: buckets removed */ }
    private get reinsurerFilters(): {
        search: string;
        reinsurer: string;
        product: string;
        effectivePeriod: string | null;
        state: string;
    } {
        const { search, reinsurer, product, effectivePeriod, state } = this.reinsurerFiltersForm.value as {
            search: string | null;
            reinsurer: string | null;
            product: string | null;
            effectivePeriod: string | null;
            state: string | null;
        };
        return {
            search: search ?? '',
            reinsurer: reinsurer ?? '',
            product: product ?? '',
            effectivePeriod: effectivePeriod ?? null,
            state: state ?? '',
        };
    }

    private computeMonthlyBuckets(): void {
        this.monthlyBucketIndex.clear();
        this.monthlyBuckets = [];
    }

    getPeriodOptions(): any[] {
        return [];
    }


    private getWeekKeyForPeriod(period: ProductPeriod | null): string | null {
        if (!period) {
            return null;
        }
        const startDate = this.parseIsoDate(period.start);
        if (!startDate) {
            return null;
        }
        const startOf = this.startOfWeek(startDate);
        const endOf = this.endOfWeek(startOf);
        return `${this.toIsoDate(startOf)}_${this.toIsoDate(endOf)}`;
    }
    isLatestWeekPeriod(_period: ProductPeriod | null): boolean {
        return false;
    }
    private parseIsoDate(raw: string | null | undefined): Date | null {
        if (!raw) {
            return null;
        }
        const trimmed = raw.trim();
        if (!trimmed) {
            return null;
        }
        const date = new Date(`${trimmed}T00:00:00Z`);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    private startOfWeek(date: Date): Date {
        const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const day = start.getUTCDay();
        const diff = (day + 6) % 7;
        start.setUTCDate(start.getUTCDate() - diff);
        return start;
    }
    private endOfWeek(start: Date): Date {
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6);
        return end;
    }
    private toIsoDate(date: Date): string {
        return date.toISOString().slice(0, 10);
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
        const startCtrl = group.get('startDate');
        const endCtrl = group.get('endDate');
        if (startCtrl?.hasError('dateRange')) {
            const { dateRange, ...rest } = startCtrl.errors as any;
            startCtrl.setErrors(Object.keys(rest).length ? rest : null);
        }
        if (endCtrl?.hasError('dateRange')) {
            const { dateRange, ...rest } = endCtrl.errors as any;
            endCtrl.setErrors(Object.keys(rest).length ? rest : null);
        }
        if (start && end && start.getTime() > end.getTime()) {
            startCtrl?.setErrors({ ...(startCtrl.errors || {}), dateRange: true });
            endCtrl?.setErrors({ ...(endCtrl.errors || {}), dateRange: true });
            return { startAfterEnd: true };
        }
        return null;
    }

    private formatWeekLabel(startIso: string, endIso: string): string {
        const startDate = this.parseIsoDate(startIso);
        const endDate = this.parseIsoDate(endIso);
        if (!startDate || !endDate) {
            return `${startIso} �� ${endIso}`;
        }
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };
        const startLabel = startDate.toLocaleDateString('en-US', options);
        const endLabel = endDate.toLocaleDateString('en-US', options);
        const yearLabel = endDate.getUTCFullYear();
        return `${startLabel} – ${endLabel}, ${yearLabel}`;
    }
    private isTreatyInSelectedBucket(treaty: ReinsurerData, bucketKey: string | null | undefined): boolean {
        if (!bucketKey) {
            return true;
        }
        const periodType = (this.reinsurerFiltersForm.get('periodType')?.value as string) || 'Weekly';
        const range = periodType === 'Monthly' ? this.monthlyBucketIndex.get(bucketKey) : this.weeklyBucketIndex.get(bucketKey);
        if (!range) {
            return true;
        }
        const treatyDate = this.parseIsoDate(treaty.periodStartDate);
        if (!treatyDate) {
            return false;
        }
        const iso = this.toIsoDate(treatyDate);
        return iso >= range.start && iso <= range.end;
    }
    hasActiveFilters(): boolean {
        const search = (this.appliedFilters.search || '').toString();
        const reinsurer = this.appliedFilters.reinsurer || '';
        const treatyId = this.appliedFilters.treatyId || '';
        const s = this.appliedFilters.start;
        const e = this.appliedFilters.end;
        const changedSearch = search.trim().length > 0;
        const changedReinsurer = reinsurer !== '';
        const changedTreaty = treatyId !== '';
        const changedStart = (s || null) !== (this.defaultStartDate || null);
        const changedEnd = (e || null) !== (this.defaultEndDate || null);
        return changedSearch || changedReinsurer || changedTreaty || changedStart || changedEnd;
    }
    getSelectedWeekSummary(): null {
        const rows = this.getFilteredTreaties();
        if (!rows.length) {
            return null;
        }
        return null;
    }
    private toLocalIso(value: any): string | null {
        if (!value) return null;
        const d = value instanceof Date ? value : (typeof value === 'string' ? this.dateFromIsoLocal(value) : null);
        if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    private dateFromIsoLocal(iso: string): Date | null {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).slice(0,10));
        if (!m) return null;
        const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
        return new Date(y, mo, d);
    }

    getExportRows(): ReinsurerData[] {
        return this.gridTreaties.length ? this.gridTreaties : this.getFilteredTreaties();
    }

    exportFilteredTreaties(): void {
        const rows = this.getExportRows();
        if (!rows.length) {
            return;
        }
        const headers = [
            'Reinsurer ID (NAIC#)',
            'Reinsurer',
            'Treaty ID',
            'Quota Share %',
            'Ceding Allowance % Premium (up front)',
            'Ceding Allowance % average AV during month (applied monthly)',
            'Expense Allowance % Commission (up front)',
            'Expense Allowance % Premium (up front)',
            'Money Type (Internal/ External)',
            'Channel',
            'Territory/ Issue State',
            'Product Name',
            'Product Code',
            'Tenor (Gtd Period)',
        ];
        const dataRows = rows.map((row) => [
            this.normalizeExportValue(row.reinsurerId),
            this.normalizeExportValue(row.reinsurerName),
            this.normalizeExportValue(row.treatyId),
            this.formatPercentDisplay(row.quotaShare),
            this.formatPercentDisplay(row.cedingAllowancePrem),
            this.formatPercentDisplay(row.cedingAllowanceAv),
            this.formatPercentDisplay(row.expenseAllowanceComm),
            this.formatPercentDisplay(row.expenseAllowancePrem),
            this.normalizeExportValue(row.moneyType),
            this.normalizeExportValue(row.channel),
            this.normalizeExportValue(row.issueStateCode),
            this.normalizeExportValue(row.productName),
            this.normalizeExportValue(row.productCode),
            this.normalizeExportValue(row.tenor),
        ]);
        const sheetData: (string | number)[][] = [headers, ...dataRows];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const columnWidths = headers.map((header, columnIndex) => {
            const maxCellLength = sheetData.reduce((max, row) => {
                const cellValue = row[columnIndex];
                const length = String(cellValue ?? '').length;
                return Math.max(max, length);
            }, header.length);
            return { wch: Math.min(Math.max(maxCellLength + 2, 12), 50) };
        });
        worksheet['!cols'] = columnWidths;
        const headerStyle = {
            font: { bold: true, color: { rgb: '111827' } },
            fill: { fgColor: { rgb: 'DBEAFE' } },
            alignment: { vertical: 'center', horizontal: 'left' as const },
        };
        headers.forEach((_, columnIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: columnIndex });
            const cell = worksheet[cellAddress];
            if (cell) {
                cell.s = headerStyle;
            }
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Treaties');
        const s = this.appliedFilters.start || this.defaultStartDate || '';
        const e = this.appliedFilters.end || this.defaultEndDate || '';
        const filenameKey = [s, e].filter(Boolean).join('_to_');
        XLSX.writeFile(workbook, `reinsurance-${filenameKey}.xlsx`, { compression: true });
    }
    private normalizeExportValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }
        const str = String(value);
        return str === '—' ? '' : str;
    }
    isExpired(endDate: string): boolean {
        return new Date(endDate) < new Date();
    }
    formatDateRange(startDate: string, endDate: string): string {
        const start = new Date(startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        const end = new Date(endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        return start + ' - ' + end;
    }
    formatCurrency(value: number): string {
        return '$' + value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    getActiveCount(): number {
        return this.reinsurerData.filter((t) => !this.isExpired(t.periodEndDate)).length;
    }
    getExpiredCount(): number {
        return this.reinsurerData.filter((t) => this.isExpired(t.periodEndDate)).length;
    }
    getFilteredTreaties(): ReinsurerData[] {
        // Treaty grid should use its own filter state, not the periods filter state
        const reinsurer = this.treatyFilter.reinsurer || '';
        const treatyId = this.treatyFilter.treatyId || '';
        const s = this.treatyFilter.start || this.defaultStartDate || null;
        const e = this.treatyFilter.end || this.defaultEndDate || null;
        const withinRange = (row: ReinsurerData) => {
            if (!s && !e) return true;
            if (s && e) return row.periodEndDate >= s && row.periodStartDate <= e;
            if (s) return row.periodEndDate >= s;
            return row.periodStartDate <= (e as string);
        };

        return this.reinsurerData.filter((treaty) => {
            const matchesReinsurer = !reinsurer || treaty.reinsurerName === reinsurer;
            const matchesTreaty = !treatyId || treaty.treatyId === treatyId;
            return withinRange(treaty) && matchesReinsurer && matchesTreaty;
        });
    }
    getFilteredTreatiesFor(reinsurer: string): ReinsurerData[] {
        return this.getFilteredTreaties().filter((r) => r.reinsurerName === reinsurer);
    }


    get filteredPeriods(): ReinsurancePeriod[] {
        const reinsurer = this.appliedFilters.reinsurer || '';
        const treatyId = this.appliedFilters.treatyId || '';
        const s = this.appliedFilters.start || this.defaultStartDate;
        const e = this.appliedFilters.end || this.defaultEndDate;
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
        const includeMonth = !!(s && e && isFullMonthRange(s, e));
        return (this.periods || []).filter(p => {
            const matchesReinsurer = !reinsurer || p.reinsurerName === reinsurer;
            const matchesTreaty = !treatyId || p.treatyId === treatyId;
            if (!matchesReinsurer || !matchesTreaty) return false;
            const typeOk = p.periodType === 'Week' || (includeMonth && p.periodType === 'Month');
            if (!typeOk) return false;
            // Containment logic: include only periods fully within the selected range
            if (s && e) return p.periodStartDate >= s && p.periodEndDate <= e;
            if (s) return p.periodEndDate >= s;
            if (e) return p.periodStartDate <= e;
            return true;
        });
    }
    get pagedPeriods(): ReinsurancePeriod[] {
        const rows = this.periods;
        const start = (this.periodsPage - 1) * this.periodsPageSize;
        return rows.slice(start, start + this.periodsPageSize);
    }
    get periodsTotal(): number {
        return this.periods.length;
    }
    get periodsTotalPages(): number {
        return Math.max(1, Math.ceil(this.periodsTotal / this.periodsPageSize));
    }
    periodsNextPage(): void { if (this.periodsPage < this.periodsTotalPages) this.periodsPage += 1; }
    periodsPrevPage(): void { if (this.periodsPage > 1) this.periodsPage -= 1; }
    setPeriodsPageSize(size: number): void { this.periodsPageSize = size; this.periodsPage = 1; }

    isPeriodRowSelected(p: ReinsurancePeriod): boolean {
        const s = this.selectedPeriodRow;
        if (!s) return false;
        return s.reinsurerName === p.reinsurerName &&
               s.treatyId === p.treatyId &&
               s.periodStartDate === p.periodStartDate &&
               s.periodEndDate === p.periodEndDate &&
               s.periodType === p.periodType;
    }

    applyReinsurerFilters(): void {
        if (this.reinsurerFiltersForm.invalid) return;
        const v = this.reinsurerFiltersForm.value as any;
        const reinsurerName: string = v.reinsurer || '';
        const reinsurerId: string = reinsurerName ? this.getReinsurerNaic(reinsurerName) : '';
        const start = this.toLocalIso(v.startDate);
        const end = this.toLocalIso(v.endDate);
        // Save filters
        this.appliedFilters = {
            search: (v.search || '').toString(),
            reinsurer: reinsurerName,
            treatyId: v.treatyId || '',
            start,
            end,
        };
        this.periodsPage = 1;
        // Hide treaty grid until a period row is explicitly selected
        this.selectedPeriodRow = null;
        this.selectedTreaty = null;
        this.selectedPeriod = null;
        this.gridTreaties = [];
        // Fetch periods via API (mock fallback) using 4 filters
        this.periodsApi.search({
            reinsurerName,
            reinsurerId: reinsurerId || null,
            treatyId: v.treatyId || null,
            start,
            end,
        }).pipe(take(1)).subscribe(periods => {
            this.periods = periods || [];
        });
    }
    getReinsurerNaic(reinsurer: string): string {
        const rows = this.getFilteredTreatiesFor(reinsurer);
        const source = rows.length
            ? rows
            : this.reinsurerData.filter((r) => r.reinsurerName === reinsurer);
        const entry = source.find((r) => (r.reinsurerId || '').trim().length > 0);
        return entry ? (entry.reinsurerId || '').trim() : '—';
    }
    getReinsurerTreaty(reinsurer: string): string {
        const rows = this.getFilteredTreatiesFor(reinsurer);
        const source = rows.length
            ? rows
            : this.reinsurerData.filter((r) => r.reinsurerName === reinsurer);
        const entry = source.find((r) => (r.treatyId || '').trim().length > 0);
        return entry ? (entry.treatyId || '').trim() : '—';
    }
    getSelectedTreatyDetails(): {
        label: string;
        value: string;
    }[] {
        if (!this.selectedTreaty) {
            return [];
        }
        const t = this.selectedTreaty;
        const percent = (value: number | null | undefined) => this.formatPercentDisplay(value);
        return [
            { label: 'Reinsurer ID (NAIC)', value: (t.reinsurerId || '').trim() || '—' },
            { label: 'Reinsurer Name', value: (t.reinsurerName || '').trim() || '—' },
            { label: 'Treaty ID', value: (t.treatyId || '').trim() || '—' },
            { label: 'Quota Share %', value: percent(t.quotaShare) },
            { label: 'Ceding Allowance % Premium', value: percent(t.cedingAllowancePrem) },
            { label: 'Ceding Allowance % Avg AV', value: percent(t.cedingAllowanceAv) },
            { label: 'Expense Allowance % Commission', value: percent(t.expenseAllowanceComm) },
            { label: 'Expense Allowance % Premium', value: percent(t.expenseAllowancePrem) },
            { label: 'Money Type', value: (t.moneyType || '').trim() || '—' },
            { label: 'Channel', value: (t.channel || '').trim() || '—' },
            { label: 'Territory', value: (t.issueStateCode || '').trim() || '—' },
            { label: 'Product Name', value: (t.productName || '').trim() || '—' },
            { label: 'Product Code', value: (t.productCode || '').trim() || '—' },
            { label: 'Tenor', value: (t.tenor || '').trim() || '—' },
        ];
    }
    private toEditableNumber(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '';
        }
        const numeric = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(numeric) ? numeric.toString() : '';
    }
    formatPercentDisplay(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '—';
        }
        const normalized = Math.abs(value) > 1 ? value : value * 100;
        return `${normalized.toFixed(2)}%`;
    }
    formatDateLabel(value: string | null | undefined): string {
        if (!value) {
            return '—';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

}
