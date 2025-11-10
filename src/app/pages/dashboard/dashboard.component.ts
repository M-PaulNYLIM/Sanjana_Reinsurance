import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../components/ui/card';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { DropdownMenuComponent, DropdownMenuItemComponent } from '../../components/ui/dropdown-menu';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
const palette = {
    navy: '#0E2240',
    blue: '#0F62FE',
    teal: '#1B7B4C',
    gold: '#D7A018',
    red: '#B91C1C',
    slate: '#475467',
    softGray: '#F2F4F7',
    mutedBlue: '#5F85C9',
    mutedBlueLight: '#98B3E6',
    mutedNavy: '#2F4A72',
    mutedGray: '#E3E8F1',
};
type Trend = 'up' | 'down' | 'steady';
declare type IconKey = 'policies' | 'reinsurers' | 'premium';
interface KPICardData {
    label: string;
    value: string;
    changeValue: string;
    changeDescription: string;
    trend: Trend;
    icon: IconKey;
    accentColor: string;
}
interface PerformancePoint {
    month: string;
    gross: number;
    net: number;
}
interface CapacitySlice {
    name: string;
    value: number;
    color: string;
}
type ReinsurerPremiumPoint = {
    reinsurer: string;
    premiumMillions: number;
};
type ReinsurerProductPoint = {
    reinsurer: string;
    product: string;
    premiumMillions: number;
};
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        CardDescriptionComponent,
        ButtonComponent,
        DropdownMenuComponent,
        DropdownMenuItemComponent,
        BaseChartDirective,
    ],
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
    get palette() {
        return palette;
    }
    activePeriod = '30d';
    timePeriods = [
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: '6m', label: '6 Months' },
        { key: '1y', label: '1 Year' },
        { key: 'ytd', label: 'YTD' },
    ];
    lastUpdate = {
        date: 'Dec 18, 2024',
        daysSince: 0,
    };
    kpiData: KPICardData[] = [
        {
            label: 'Total Policies',
            value: '1,382',
            changeValue: '+6.9%',
            changeDescription: 'from last month',
            trend: 'up',
            icon: 'policies',
            accentColor: palette.blue,
        },
        {
            label: 'Active Reinsurers',
            value: '22',
            changeValue: '+1',
            changeDescription: 'new this month',
            trend: 'up',
            icon: 'reinsurers',
            accentColor: palette.teal,
        },
        {
            label: 'Total Premium',
            value: '$36.1M',
            changeValue: '+9.7%',
            changeDescription: 'from last month',
            trend: 'up',
            icon: 'premium',
            accentColor: palette.gold,
        },
    ];
    performanceData: PerformancePoint[] = [
        { month: 'Jul', gross: 2.7, net: 1.62 },
        { month: 'Aug', gross: 2.8, net: 1.65 },
        { month: 'Sep', gross: 2.95, net: 1.71 },
        { month: 'Oct', gross: 3.0, net: 1.76 },
        { month: 'Nov', gross: 3.05, net: 1.8 },
        { month: 'Dec', gross: 3.1, net: 1.84 },
    ];
    capacityMix: CapacitySlice[] = [
        { name: 'Everlake Life Insurance Company', value: 34, color: palette.mutedBlueLight },
        { name: 'Guardian Reinsurance Company', value: 27, color: '#7FA4D6' },
        { name: 'MetLife Reinsurance', value: 22, color: palette.mutedBlue },
        { name: 'Global Treaty Partners', value: 17, color: palette.mutedNavy },
    ];
    legendColors = {
        gross: palette.mutedBlue,
        net: palette.mutedBlueLight,
    };
    readonly reinsurerPremiumSeries: ReinsurerPremiumPoint[] = [
        { reinsurer: 'Everlake Life Insurance Company', premiumMillions: 5.8 },
        { reinsurer: 'Guardian Reinsurance Company', premiumMillions: 4.6 },
        { reinsurer: 'MetLife Reinsurance', premiumMillions: 3.9 },
        { reinsurer: 'Global Treaty Partners', premiumMillions: 3.1 },
    ];
    readonly reinsurerTopProductSeries: ReinsurerProductPoint[] = [
        {
            reinsurer: 'Everlake Life Insurance Company',
            product: 'Secure Term Choice Fixed Annuity II',
            premiumMillions: 3.2,
        },
        {
            reinsurer: 'Guardian Reinsurance Company',
            product: 'Secure Term MVA Fixed Annuity IV',
            premiumMillions: 2.6,
        },
        {
            reinsurer: 'MetLife Reinsurance',
            product: 'Shield Variable Annuity',
            premiumMillions: 2.1,
        },
        {
            reinsurer: 'Global Treaty Partners',
            product: 'Structured Settlements Program',
            premiumMillions: 1.8,
        },
    ];
    performanceChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: palette.slate,
                },
            },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: palette.slate },
            },
            y: {
                beginAtZero: true,
                grid: { color: palette.mutedGray },
                ticks: { color: palette.slate },
            },
        },
    };
    pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: { enabled: true },
        },
    };
    reinsurerPremiumChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
                grid: { color: palette.mutedGray },
                ticks: { color: palette.slate },
                title: { display: true, text: 'Premium ($M)', color: palette.slate, font: { size: 12 } },
            },
            y: {
                grid: { display: false },
                ticks: { color: palette.slate },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `$${ctx.parsed.x?.toFixed(1)}M`,
                },
            },
        },
        elements: {
            bar: { borderRadius: 6 },
        },
    };
    topProductChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
                grid: { color: palette.mutedGray },
                ticks: { color: palette.slate },
                title: { display: true, text: 'Premium ($M)', color: palette.slate, font: { size: 12 } },
            },
            y: {
                grid: { display: false },
                ticks: { color: palette.slate },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: $${ctx.parsed.x?.toFixed(1)}M`,
                },
            },
        },
        elements: {
            bar: { borderRadius: 6 },
        },
    };
    performanceChartData!: ChartData<'line'>;
    capacityChartData!: ChartData<'doughnut'>;
    reinsurerPremiumChartData!: ChartData<'bar'>;
    topProductChartData!: ChartData<'bar'>;
    ngOnInit(): void {
        this.initializeChartData();
    }
    getPeriodButtonClasses(periodKey: string): string {
        const isActive = this.activePeriod === periodKey;
        return `rounded-full px-4 py-1.5 text-sm font-medium transition ${isActive
            ? 'bg-nyl-navy text-white shadow-sm'
            : 'text-gray-600 hover:text-nyl-navy hover:bg-gray-100'}`;
    }
    setActivePeriod(period: string): void {
        this.activePeriod = period;
    }
    handleExport(format: string): void {
        console.log(`Exporting dashboard as ${format}`);
    }
    getTrendTextClass(trend: Trend): string {
        switch (trend) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    }
    getIconStyles(color: string): {
        color: string;
        backgroundColor: string;
    } {
        const rgb = this.hexToRgb(color);
        const backgroundColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : palette.softGray;
        return { color, backgroundColor };
    }
    private initializeChartData(): void {
        this.performanceChartData = {
            labels: this.performanceData.map((d) => d.month),
            datasets: [
                {
                    label: 'Gross Written Premium ($B)',
                    data: this.performanceData.map((d) => d.gross),
                    borderColor: palette.mutedBlue,
                    backgroundColor: palette.mutedBlue + '1A',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                },
                {
                    label: 'Net Premium ($B)',
                    data: this.performanceData.map((d) => d.net),
                    borderColor: palette.mutedBlueLight,
                    backgroundColor: palette.mutedBlueLight + '26',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                },
            ],
        };
        this.capacityChartData = {
            labels: this.capacityMix.map((slice) => slice.name),
            datasets: [
                {
                    data: this.capacityMix.map((slice) => slice.value),
                    backgroundColor: this.capacityMix.map((slice) => slice.color),
                    borderWidth: 0,
                },
            ],
        };
        this.reinsurerPremiumChartData = {
            labels: this.reinsurerPremiumSeries.map((item) => item.reinsurer),
            datasets: [
                {
                    label: 'Premium',
                    data: this.reinsurerPremiumSeries.map((item) => item.premiumMillions),
                    backgroundColor: this.reinsurerPremiumSeries.map(() => palette.mutedBlue),
                    hoverBackgroundColor: this.reinsurerPremiumSeries.map(() => palette.mutedNavy),
                    borderWidth: 0,
                },
            ],
        };
        this.topProductChartData = {
            labels: this.reinsurerTopProductSeries.map((item) => item.product),
            datasets: [
                {
                    label: 'Premium',
                    data: this.reinsurerTopProductSeries.map((item) => item.premiumMillions),
                    backgroundColor: this.reinsurerTopProductSeries.map(() => palette.mutedBlueLight),
                    hoverBackgroundColor: this.reinsurerTopProductSeries.map(() => palette.mutedBlue),
                    borderWidth: 0,
                },
            ],
        };
    }
    private hexToRgb(hex: string): {
        r: number;
        g: number;
        b: number;
    } | null {
        const sanitized = hex.replace('#', '');
        if (sanitized.length !== 6) {
            return null;
        }
        const bigint = parseInt(sanitized, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    }
}
