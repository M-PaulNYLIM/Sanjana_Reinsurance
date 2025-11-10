import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { startWith, tap, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSelectPositionFixDirective } from '../../directives/mat-select-position-fix.directive';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { CardComponent, CardContentComponent } from '../../components/ui/card';
import { AuthService } from '../../auth/auth.service';
import { UploadHistoryService, UploadHistoryRecord } from '../../../services/upload-history.service';

interface UploadRecord {
    id: number;
    filename: string;
    user: string;
    date: string;
    status: 'Processed' | 'Failed';
    timestamp: Date;
}

type StatusFilter = UploadHistoryRecord['status'] | 'All';

@Component({
    selector: 'app-upload-history',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatSelectPositionFixDirective,
        ButtonComponent,
        CardComponent,
        CardContentComponent,
    ],
    templateUrl: './upload-history.component.html',
    styleUrls: ['./upload-history.component.scss'],
})
export class UploadHistoryComponent implements OnDestroy {
    readonly filterForm: FormGroup;
    protected records: UploadHistoryRecord[] = [];
    private applied: { search: string; status: StatusFilter; startDate: Date | null; endDate: Date | null } = {
        search: '',
        status: 'All',
        startDate: null,
        endDate: null,
    };
    readonly statusOptions: { label: string; value: StatusFilter }[] = [
        { label: 'All', value: 'All' },
        { label: 'Processed', value: 'Processed' },
        { label: 'Failed', value: 'Failed' },
    ];

    readonly isReadOnly$!: Observable<boolean>;
    private isReadOnly!: boolean;
    private readonly subscriptions = new Subscription();
    private enterGuard: MatSelect | null = null;

    constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly history: UploadHistoryService) {
        this.filterForm = this.fb.group({
            search: [''],
            status: ['All' as StatusFilter],
            startDate: [null],
            endDate: [null],
        });
        this.isReadOnly = this.auth.isRouteReadOnly('/upload-history');
        this.isReadOnly$ = this.auth.activeRole$.pipe(
            map(() => this.auth.isRouteReadOnly('/upload-history')),
            tap((value) => (this.isReadOnly = value)),
            startWith(this.isReadOnly),
        );
        const sub = this.isReadOnly$.subscribe();
        this.subscriptions.add(sub);
        const histSub = this.history.records$.subscribe((items) => {
            this.records = items;
        });
        this.subscriptions.add(histSub);
    }
    get totalUploads(): number {
        return this.records.length;
    }
    get processedUploads(): number {
        return this.records.filter((record) => record.status === 'Processed').length;
    }
    get failedUploads(): number {
        return this.records.filter((record) => record.status === 'Failed').length;
    }
    get filteredRecords(): UploadHistoryRecord[] {
        const { startDate, endDate, status, search } = this.applied;
        return this.records
            .filter((record) => this.matchesDateRange(record, startDate, endDate))
            .filter((record) => this.matchesStatus(record, status))
            .filter((record) => this.matchesSearch(record, search));
    }

    private get filters(): { startDate: Date | null; endDate: Date | null; status: StatusFilter; search: string } {
        const { startDate, endDate, status, search } = this.filterForm.value as {
            startDate: Date | null;
            endDate: Date | null;
            status: StatusFilter;
            search: string | null;
        };

        return {
            startDate,
            endDate,
            status,
            search: search ?? '',
        };
    }

    hasActiveFilters(): boolean {
        const { search, status, startDate, endDate } = this.filterForm.value as {
            search: string | null;
            status: StatusFilter;
            startDate: Date | null;
            endDate: Date | null;
        };
        const base = { search: '', status: 'All' as StatusFilter, startDate: null, endDate: null };
        return (search ?? '') !== base.search || status !== base.status || startDate !== base.startDate || endDate !== base.endDate;
    }

    clearFilters(): void {
        this.filterForm.reset({
            search: '',
            status: 'All' as StatusFilter,
            startDate: null,
            endDate: null,
        });
        this.applied = { search: '', status: 'All', startDate: null, endDate: null };
    }

    onSearch(): void {
        const { search, status, startDate, endDate } = this.filterForm.value as {
            search: string | null;
            status: StatusFilter;
            startDate: Date | null;
            endDate: Date | null;
        };
        this.applied = {
            search: (search || '').trim(),
            status,
            startDate: startDate || null,
            endDate: endDate || null,
        };
    }

    hasAppliedFilters(): boolean {
        const a = this.applied;
        return a.search !== '' || a.status !== 'All' || a.startDate !== null || a.endDate !== null;
    }

    clearStartDate(): void {
        this.filterForm.patchValue({ startDate: null });
    }

    clearEndDate(): void {
        this.filterForm.patchValue({ endDate: null });
    }
    onDownload(record: UploadHistoryRecord): void {
        if (this.isReadOnly) {
            return;
        }
        this.history.triggerDownload(record);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private matchesDateRange(record: UploadHistoryRecord, start: Date | null, end: Date | null): boolean {
        const normalizedStart = start ? this.startOfDay(start) : null;
        const normalizedEnd = end ? this.endOfDay(end) : null;

        if (normalizedStart && record.timestamp < normalizedStart) {
            return false;
        }
        if (normalizedEnd && record.timestamp > normalizedEnd) {
            return false;
        }
        return true;
    }
    private startOfDay(date: Date): Date {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }
    private endOfDay(date: Date): Date {
        const normalized = new Date(date);
        normalized.setHours(23, 59, 59, 999);
        return normalized;
    }

    private matchesStatus(record: UploadHistoryRecord, status: StatusFilter): boolean {
        if (status === 'All') {
            return true;
        }
        return record.status === status;
    }

    private matchesSearch(record: UploadHistoryRecord, search: string): boolean {
        const query = search.trim().toLowerCase();
        if (!query) {
            return true;
        }
        return record.filename.toLowerCase().includes(query) || record.user.toLowerCase().includes(query);
    }

    formatEffectivePeriod(weekKey?: string | null): string {
        if (!weekKey) return '—';
        const [startIso, endIso] = weekKey.split('_');
        if (!startIso || !endIso) return weekKey;
        const start = new Date(`${startIso}T00:00:00Z`);
        const end = new Date(`${endIso}T00:00:00Z`);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return weekKey;
        const isMonthStart = start.getUTCDate() === 1;
        const isMonthEnd = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate() === end.getUTCDate();
        if (isMonthStart && isMonthEnd && start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) {
            return start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${s} – ${e}`;
    }

    private seedData(): UploadRecord[] {
        const base: Omit<UploadRecord, 'timestamp'>[] = [
            {
                id: 1,
                filename: 'Reinsurance_Rates_Jan2025.xlsx',
                user: 'Lauren M. Cocchiareli',
                date: '2025-01-15 14:32',
                status: 'Processed',
            },
            {
                id: 2,
                filename: 'Reinsurance_Rates_Feb2025.xlsx',
                user: 'Lauren M. Cocchiareli',
                date: '2025-02-10 09:15',
                status: 'Processed',
            },
            {
                id: 3,
                filename: 'Reinsurance_Rates_Mar2025.xlsx',
                user: 'Lauren M. Cocchiareli',
                date: '2025-03-01 11:22',
                status: 'Failed',
            },
        ];
        return base.map((item) => ({
            ...item,
            timestamp: this.toTimestamp(item.date),
        }));
    }
    private toTimestamp(source: string): Date {
        const normalized = source.includes('T') ? source : `${source.replace(' ', 'T')}:00`;
        return new Date(normalized);
    }

    hasAnyRecords(): boolean { return this.records.length > 0; }

    onFormEnter(event: Event): void {
        const hasOpenSelect = typeof document !== 'undefined' && !!document.querySelector('.mat-mdc-select-panel');
        const hasOpenDate = typeof document !== 'undefined' && !!document.querySelector('.mat-datepicker-content');
        if (hasOpenSelect || hasOpenDate) return;
        event.preventDefault();
        (event as any).stopPropagation?.();
        try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
        this.onSearch();
    }

    onSelectOpenedChange(select: MatSelect, opened: boolean): void {
        if (opened && this.enterGuard === select) {
            try { select.close(); } catch {}
            setTimeout(() => {
                try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
                this.onSearch();
                this.enterGuard = null;
            });
        }
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
                try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
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
}
