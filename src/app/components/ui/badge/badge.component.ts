import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createVariants, cn } from '../../../../lib/utils';
const badgeVariants = createVariants({
    base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
            secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
            outline: 'text-foreground',
            success: 'border-transparent bg-success text-white hover:bg-success/80',
            warning: 'border-transparent bg-warning text-white hover:bg-warning/80',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
@Component({
    selector: 'ui-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./badge.component.html",
    styleUrls: ["./badge.component.scss"]
})
export class BadgeComponent {
    @Input()
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'default';
    @Input()
    class?: string;
    getBadgeClasses(): string {
        return badgeVariants({
            variant: this.variant,
            class: this.class,
        });
    }
}
