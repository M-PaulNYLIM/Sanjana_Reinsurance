import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';
@Component({
    selector: 'ui-label',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./label.component.html",
    styleUrls: ["./label.component.scss"]
})
export class LabelComponent {
    @Input()
    class?: string;
    getLabelClasses(): string {
        return cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', this.class);
    }
}
