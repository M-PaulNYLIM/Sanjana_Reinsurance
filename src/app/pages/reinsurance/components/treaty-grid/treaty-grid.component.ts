import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  AccordionComponent,
  AccordionContentComponent,
  AccordionItemComponent,
  AccordionTriggerComponent,
} from '../../../../components/ui/accordion';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { ReinsurerData, ProductPeriod } from '../../reinsurance.types';

@Component({
    selector: 'app-treaty-grid',
    standalone: true,
    imports: [
        CommonModule,
        AccordionComponent,
        AccordionItemComponent,
        AccordionTriggerComponent,
        AccordionContentComponent,
        ButtonComponent,
    ],
    templateUrl: './treaty-grid.component.html',
    styleUrls: ['./treaty-grid.component.scss'],
})
export class TreatyGridComponent {
    @Input() treaties: ReinsurerData[] = [];
    @Input() allTreaties: ReinsurerData[] = [];
    @Input() latestWeekKey: string | null = null;
    @Input() activeTreaty: ReinsurerData | null = null;

    @Output() viewTreaty = new EventEmitter<{ treaty: ReinsurerData; period: ProductPeriod | null }>();
    @Output() editTreaty = new EventEmitter<{ treaty: ReinsurerData; period: ProductPeriod }>();
    @Output() clearSelection = new EventEmitter<void>();

    @ViewChild('reinsurerAccordion') reinsurerAccordion?: AccordionComponent;

    openProducts = new Set<string>();
    private readonly tableDisplayPeriods = new Set<string>();
    private readonly tableDisplayProducts = new Set<string>();
    private readonly blankProducts = new Set<string>();
    private readonly tenorAccordionProducts = new Set<string>();
    private readonly tenorGroupState = new Map<string, boolean>();
    private readonly productPeriodSelection = new Map<string, string>();
    private readonly placeholderProductsByReinsurer = new Map<string, string[]>([
        ['Everlake Life Insurance Company', ['Secure Term Choice Fixed Annuity']],
    ]);

    constructor() {
        const normalizedProduct = this.normalizeProductName('Secure Term Choice Fixed Annuity');
        this.tableDisplayProducts.add(normalizedProduct);
        this.tenorAccordionProducts.add(normalizedProduct);
    }

    getReinsurers(): string[] {
        const names = new Set<string>();
        for (const treaty of this.treaties) {
            names.add(treaty.reinsurerName);
        }
        return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
    }

    getFilteredTreatiesFor(reinsurer: string): ReinsurerData[] {
        return this.treaties.filter((r) => r.reinsurerName === reinsurer);
    }

    getReinsurerNaic(reinsurer: string): string {
        const rows = this.getFilteredTreatiesFor(reinsurer);
        const source = rows.length ? rows : this.allTreaties.filter((r) => r.reinsurerName === reinsurer);
        const entry = source.find((r) => (r.reinsurerId || '').trim().length > 0);
        return entry ? (entry.reinsurerId || '').trim() : '—';
    }

    getReinsurerTreaty(reinsurer: string): string {
        const rows = this.getFilteredTreatiesFor(reinsurer);
        const source = rows.length ? rows : this.allTreaties.filter((r) => r.reinsurerName === reinsurer);
        const entry = source.find((r) => (r.treatyId || '').trim().length > 0);
        return entry ? (entry.treatyId || '').trim() : '—';
    }

    toggleProductOpen(key: string): void {
        if (this.openProducts.has(key)) {
            this.openProducts.delete(key);
            this.clearSelection.emit();
        }
        else {
            this.openProducts.add(key);
        }
    }

    isProductOpen(key: string): boolean {
        return this.openProducts.has(key);
    }

    collapseAllReinsurers(): void {
        this.reinsurerAccordion?.openItems.clear();
        if (this.reinsurerAccordion?.type === 'multiple') {
            this.reinsurerAccordion.valueChange.emit([]);
        }
        else if (this.reinsurerAccordion) {
            this.reinsurerAccordion.valueChange.emit('');
        }
        this.openProducts.clear();
        this.tenorGroupState.clear();
        this.clearSelection.emit();
    }

    hasAnyReinsurerExpanded(): boolean {
        return (this.reinsurerAccordion?.openItems.size ?? 0) > 0;
    }

    getProductGroupsFor(reinsurer: string): {
        key: string;
        productName: string;
        tenors: string;
        tenorList: string[];
        dateRange: string;
        periodCount: number;
        count: number;
        periods: ProductPeriod[];
    }[] {
        const rows = this.getFilteredTreatiesFor(reinsurer);
    const hasResultsForReinsurer = rows.length > 0;
    const map = new Map<string, {
            productName: string;
            tenorSet: Set<string>;
            minDate: string;
            maxDate: string;
            items: ReinsurerData[];
        }>();
        for (const r of rows) {
            const key = this.normalizeProductName(r.productName);
            const displayName = r.productName?.trim() || '';
            const group = map.get(key) || {
                productName: displayName,
                tenorSet: new Set<string>(),
                minDate: r.periodStartDate,
                maxDate: r.periodEndDate,
                items: [],
            };
            group.minDate = group.minDate < r.periodStartDate ? group.minDate : r.periodStartDate;
            group.maxDate = group.maxDate > r.periodEndDate ? group.maxDate : r.periodEndDate;
            if (r.tenor) {
                group.tenorSet.add(String(r.tenor).trim());
            }
            group.items.push(r);
            map.set(key, group);
        }
        const result: {
            key: string;
            productName: string;
            tenors: string;
            tenorList: string[];
            dateRange: string;
            periodCount: number;
            count: number;
            periods: ProductPeriod[];
        }[] = [];
        for (const [key, group] of map) {
            const periodBuckets = new Map<string, {
                start: string;
                end: string;
                treaties: ReinsurerData[];
            }>();
            for (const item of group.items) {
                const start = ((item.periodStartDate || group.minDate) ?? '').slice(0, 10);
                const end = ((item.periodEndDate || group.maxDate) ?? '').slice(0, 10);
                if (!start || !end) {
                    continue;
                }
                const bucketKey = `${start}|${end}`;
                if (!periodBuckets.has(bucketKey)) {
                    periodBuckets.set(bucketKey, { start, end, treaties: [] });
                }
                periodBuckets.get(bucketKey)!.treaties.push(item);
            }
            const normalizedProductKey = this.normalizeProductName(group.productName);
            const periodsArr = Array.from(periodBuckets.values())
                .map((bucket) => {
                    const sortedTreaties = bucket.treaties.sort((a, b) => a.treatyId.localeCompare(b.treatyId));
                    const lookupKey = this.toPeriodKey(group.productName, bucket.start, bucket.end);
                    const viewAsTable = this.tableDisplayPeriods.has(lookupKey) ||
                        this.tableDisplayProducts.has(normalizedProductKey);
                    return {
                        start: bucket.start,
                        end: bucket.end,
                        treaties: sortedTreaties,
                        viewAsTable,
                    };
                })
                .sort((a, b) => a.start === b.start ? a.end.localeCompare(b.end) : a.start.localeCompare(b.start));
            const tenorList = Array.from(group.tenorSet.values())
                .map((value) => this.normalizeTenorValue(value))
                .filter((value) => value.length > 0)
                .sort((a, b) => a.localeCompare(b));
            result.push({
                key,
                productName: group.productName,
                tenors: tenorList.join(', '),
                tenorList,
                dateRange: this.formatDateRange(group.minDate, group.maxDate),
                periodCount: periodsArr.length,
                count: group.items.length,
                periods: periodsArr,
            });
        }
        const placeholders = this.placeholderProductsByReinsurer.get(reinsurer) ?? [];
        if (!hasResultsForReinsurer) {
            for (const productName of placeholders) {
                const normalizedKey = this.normalizeProductName(productName);
                const alreadyExists = result.some((entry) => entry.key === normalizedKey);
                if (!alreadyExists) {
                    result.push({
                        key: normalizedKey,
                        productName,
                        tenors: '',
                        tenorList: [],
                        dateRange: '',
                        periodCount: 0,
                        count: 0,
                        periods: [],
                    });
                }
            }
        }
        for (const entry of result) {
            if (this.isBlankProduct(entry.key)) {
                entry.periods = [];
                entry.tenors = '';
                entry.tenorList = [];
                entry.periodCount = 0;
                entry.count = 0;
            }
            for (const period of entry.periods) {
                const tenorGroups = this.groupTreatiesByTenor(period.treaties);
                for (const group of tenorGroups) {
                    const key = this.getTenorGroupKey(entry.productName, period, group.tenor);
                    if (!this.tenorGroupState.has(key)) {
                        this.tenorGroupState.set(key, false);
                    }
                }
            }
        }
        return result.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    getActivePeriodForProduct(productKey: string, periods: ProductPeriod[]): ProductPeriod | null {
        if (!periods.length) {
            return null;
        }
        const normalizedProduct = this.normalizeProductName(productKey);
        const selectedKey = this.productPeriodSelection.get(normalizedProduct);
        if (selectedKey) {
            const match = periods.find((period) => this.toPeriodKey(normalizedProduct, period.start, period.end) === selectedKey);
            if (match) {
                return match;
            }
        }
        const first = periods[0];
        this.productPeriodSelection.set(normalizedProduct, this.toPeriodKey(normalizedProduct, first.start, first.end));
        for (const tenorGroup of this.groupTreatiesByTenor(first.treaties)) {
            const key = this.getTenorGroupKey(productKey, first, tenorGroup.tenor);
            if (!this.tenorGroupState.has(key)) {
                this.tenorGroupState.set(key, false);
            }
        }
        return first;
    }

    getVisibleCounts(_productKey: string, periods: ProductPeriod[]): {
        recordCount: number;
        periodCount: number;
    } {
        const recordCount = periods.reduce((total, period) => total + period.treaties.length, 0);
        const periodCount = periods.filter((period) => period.treaties.length > 0).length;
        return { recordCount, periodCount };
    }

    isBlankProduct(productKey: string): boolean {
        return this.blankProducts.has(productKey);
    }

    groupTreatiesByTenor(treaties: ReinsurerData[]): {
        tenor: string;
        records: ReinsurerData[];
    }[] {
        const byTenor = new Map<string, ReinsurerData[]>();
        for (const record of treaties) {
            const tenorLabel = this.normalizeTenorValue(record.tenor) || 'N/A';
            if (!byTenor.has(tenorLabel)) {
                byTenor.set(tenorLabel, []);
            }
            byTenor.get(tenorLabel)!.push(record);
        }
        return Array.from(byTenor.entries())
            .map(([tenor, records]) => ({
            tenor,
            records: this.sortTenorRecords(records),
        }))
            .sort((a, b) => this.compareTenorLabels(a.tenor, b.tenor));
    }

    toggleTenorGroup(productKey: string, period: ProductPeriod, tenor: string): void {
        const key = this.getTenorGroupKey(productKey, period, tenor);
        const current = this.tenorGroupState.get(key) ?? false;
        this.tenorGroupState.set(key, !current);
    }

    expandAllTenorGroups(productKey: string, period: ProductPeriod | null, tenorGroups: { tenor: string; records: ReinsurerData[] }[]): void {
        if (!period) {
            return;
        }
        for (const group of tenorGroups) {
            const key = this.getTenorGroupKey(productKey, period, group.tenor);
            this.tenorGroupState.set(key, true);
        }
    }

    collapseAllTenorGroups(productKey: string, period: ProductPeriod | null, tenorGroups: { tenor: string; records: ReinsurerData[] }[]): void {
        if (!period) {
            return;
        }
        for (const group of tenorGroups) {
            const key = this.getTenorGroupKey(productKey, period, group.tenor);
            this.tenorGroupState.set(key, false);
        }
    }

    areAllTenorGroupsOpen(productKey: string, period: ProductPeriod | null, tenorGroups: { tenor: string; records: ReinsurerData[] }[]): boolean {
        if (!period || tenorGroups.length === 0) {
            return false;
        }
        return tenorGroups.every((group) => this.isTenorGroupOpen(productKey, period, group.tenor));
    }

    areAllTenorGroupsCollapsed(productKey: string, period: ProductPeriod | null, tenorGroups: { tenor: string; records: ReinsurerData[] }[]): boolean {
        if (!period || tenorGroups.length === 0) {
            return true;
        }
        return tenorGroups.every((group) => !this.isTenorGroupOpen(productKey, period, group.tenor));
    }

    isTenorGroupOpen(productKey: string, period: ProductPeriod, tenor: string): boolean {
        const key = this.getTenorGroupKey(productKey, period, tenor);
        return this.tenorGroupState.get(key) ?? false;
    }

    isActiveTreaty(treaty: ReinsurerData): boolean {
        if (!this.activeTreaty) {
            return false;
        }
        const target = this.activeTreaty;
        return this.normalizeIdentifier(treaty.policyNumber) === this.normalizeIdentifier(target.policyNumber)
            && this.normalizeIdentifier(treaty.treatyId) === this.normalizeIdentifier(target.treatyId)
            && this.normalizeIdentifier(treaty.reinsurerId) === this.normalizeIdentifier(target.reinsurerId);
    }

    onViewTreaty(treaty: ReinsurerData, period: ProductPeriod | null, event?: Event): void {
        event?.stopPropagation();
        this.viewTreaty.emit({ treaty, period });
    }

    onEditTreaty(treaty: ReinsurerData, period: ProductPeriod, event?: Event): void {
        event?.stopPropagation();
        this.editTreaty.emit({ treaty, period });
    }

    trackByTenorLabel(_index: number, group: { tenor: string }): string {
        return group.tenor ?? 'N/A';
    }

    trackByTreatyRow(_index: number, treaty: ReinsurerData): string {
        return [
            treaty.reinsurerId,
            treaty.treatyId,
            treaty.productCode,
            treaty.tenor,
            treaty.moneyType,
            treaty.channel,
            treaty.issueStateCode,
        ]
            .map((part) => (part ?? '').toString().trim())
            .join('|');
    }

    formatPercentDisplay(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '—';
        }
        const normalized = Math.abs(value) > 1 ? value : value * 100;
        return `${normalized.toFixed(2)}%`;
    }

    formatDateRange(startDate: string, endDate: string): string {
        if (!startDate || !endDate) {
            return '';
        }
        const start = new Date(startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        const end = new Date(endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        return `${start} - ${end}`;
    }

    getProductCodeForPeriod(period: ProductPeriod | null): string {
        const record = period?.treaties?.[0];
        return record?.productCode || '—';
    }

    isLatestWeekPeriod(period: ProductPeriod | null): boolean {
        if (!period || !this.latestWeekKey) {
            return false;
        }
        const start = (period.start || '').slice(0, 10);
        const end = (period.end || '').slice(0, 10);
        if (!start || !end) {
            return false;
        }
        return `${start}_${end}` === this.latestWeekKey;
    }

    private normalizeProductName(name: string | null | undefined): string {
        return (name || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    private normalizeTenorValue(value: string | null | undefined): string {
        return (value ?? '').trim();
    }

    private normalizeIdentifier(value: string | null | undefined): string {
        return (value ?? '').trim().toLowerCase();
    }

    private toPeriodKey(productName: string, start: string, end: string): string {
        const normalizeDate = (value: string) => (value || '').slice(0, 10);
        return [this.normalizeProductName(productName), normalizeDate(start), normalizeDate(end)].join('|');
    }

    private getTenorGroupKey(productKey: string, period: ProductPeriod, tenor: string): string {
        const normalizedProduct = this.normalizeProductName(productKey);
        const normalizedTenor = this.normalizeTenorValue(tenor) || 'N/A';
        const start = (period?.start || '').slice(0, 10);
        const end = (period?.end || '').slice(0, 10);
        return [normalizedProduct, start, end, normalizedTenor].join('|');
    }

    private compareTenorLabels(a: string, b: string): number {
        const aNum = Number.parseInt(a, 10);
        const bNum = Number.parseInt(b, 10);
        const aIsNum = Number.isFinite(aNum);
        const bIsNum = Number.isFinite(bNum);
        if (aIsNum && bIsNum && aNum !== bNum) {
            return aNum - bNum;
        }
        if (aIsNum && !bIsNum) {
            return -1;
        }
        if (!aIsNum && bIsNum) {
            return 1;
        }
        return a.localeCompare(b);
    }

    private sortTenorRecords(records: ReinsurerData[]): ReinsurerData[] {
        return [...records].sort((a, b) => {
            const stateCompare = (a.issueStateCode || '').localeCompare(b.issueStateCode || '');
            if (stateCompare !== 0) {
                return stateCompare;
            }
            const moneyCompare = (a.moneyType || '').localeCompare(b.moneyType || '');
            if (moneyCompare !== 0) {
                return moneyCompare;
            }
            const channelCompare = (a.channel || '').localeCompare(b.channel || '');
            if (channelCompare !== 0) {
                return channelCompare;
            }
            const quotaCompare = (a.quotaShare ?? 0) - (b.quotaShare ?? 0);
            if (quotaCompare !== 0) {
                return quotaCompare;
            }
            return (a.policyNumber || '').localeCompare(b.policyNumber || '');
        });
    }
}
