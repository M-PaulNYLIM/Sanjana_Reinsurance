import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';
@Component({
    selector: 'ui-progress',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./progress.component.html",
    styleUrls: ["./progress.component.scss"]
})
export class ProgressComponent {
    @Input()
    value: number = 0;
    @Input()
    class?: string;
    getProgressClasses(): string {
        return cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', this.class);
    }
}
