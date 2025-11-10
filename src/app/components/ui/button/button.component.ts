import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createVariants, cn } from '../../../../lib/utils';
const buttonVariants = createVariants({
    base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            plain: "bg-transparent",
            link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
@Component({
    selector: 'ui-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./button.component.html",
    styleUrls: ["./button.component.scss"]
})
export class ButtonComponent {
    @Input()
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'plain' | 'link' = 'default';
    @Input()
    size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
    @Input()
    disabled: boolean = false;
    @Input()
    loading: boolean = false;
    @Input()
    loadingText?: string;
    @Input()
    type: 'button' | 'submit' | 'reset' = 'button';
    @Input()
    class?: string;
    @Output()
    clicked = new EventEmitter<Event>();
    getButtonClasses(): string {
        return buttonVariants({
            variant: this.variant,
            size: this.size,
            class: this.class
        });
    }
    handleClick(event: Event): void {
        if (!this.disabled && !this.loading) {
            this.clicked.emit(event);
        }
    }
}
