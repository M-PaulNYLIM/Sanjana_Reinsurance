import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';
@Component({
    selector: 'ui-separator',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./separator.component.html",
    styleUrls: ["./separator.component.scss"]
})
export class SeparatorComponent {
    @Input()
    orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input()
    class?: string;
    getSeparatorClasses(): string {
        return cn('shrink-0 bg-border', this.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', this.class);
    }
}
