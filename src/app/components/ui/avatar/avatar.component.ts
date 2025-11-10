import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';
@Component({
    selector: 'ui-avatar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./avatar.component.html",
    styleUrls: ["./avatar.component.scss"]
})
export class AvatarComponent {
    @Input()
    src?: string;
    @Input()
    alt?: string;
    @Input()
    class?: string;
    getAvatarClasses(): string {
        return cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', this.class);
    }
}
@Component({
    selector: 'ui-avatar-fallback',
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./avatar-fallback.component.html",
    styleUrls: ["./avatar-fallback.component.scss"]
})
export class AvatarFallbackComponent {
    @Input()
    class?: string;
    getFallbackClasses(): string {
        return cn('flex h-full w-full items-center justify-center rounded-full bg-muted', this.class);
    }
}
