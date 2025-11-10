import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { createVariants } from '../../../../lib/utils';
import { Toast } from '../../../../lib/types';

const toastVariants = createVariants({
  base: 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-in slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
  variants: {
    variant: {
      default: 'border bg-background text-foreground',
      destructive: 'border-destructive bg-destructive text-destructive-foreground',
      success: 'border-success bg-success text-white',
      warning: 'border-warning bg-warning text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('slideIn', [
      state('void', style({ opacity: 0, transform: 'translateY(-16px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(-16px)' }),
        animate('200ms ease-out')
      ]),
      transition('* => void', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(32px)' }))
      ]),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input()
  toast!: Toast;

  @Output()
  dismissed = new EventEmitter<string>();

  private autoCloseTimeout?: number;

  ngOnInit(): void {
    if (this.toast.duration && this.toast.duration > 0) {
      this.autoCloseTimeout = window.setTimeout(() => {
        this.onClose();
      }, this.toast.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  getToastClasses(): string {
    return toastVariants({
      variant: this.toast.variant || 'default',
    });
  }

  onClose(): void {
    this.dismissed.emit(this.toast.id);
  }

  onActionClick(): void {
    if (this.toast.action?.onClick) {
      this.toast.action.onClick();
    }
  }
}
