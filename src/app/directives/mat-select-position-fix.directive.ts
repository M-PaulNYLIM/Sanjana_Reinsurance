import { Directive, NgZone, OnDestroy } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { ScrollDispatcher } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'mat-select[appMatSelectPositionFix]',
  standalone: true,
})
export class MatSelectPositionFixDirective implements OnDestroy {
  private cleanupListeners: Array<() => void> = [];
  private scrollSubscription?: Subscription;

  constructor(
    private readonly matSelect: MatSelect,
    private readonly ngZone: NgZone,
    private readonly scrollDispatcher: ScrollDispatcher,
  ) {
    this.matSelect.openedChange.subscribe((opened) => {
      if (opened) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    });
  }

  private startMonitoring(): void {
    this.scheduleUpdate();

    if (typeof window === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const schedule = () => this.scheduleUpdate();

      const resizeHandler = () => schedule();
      window.addEventListener('resize', resizeHandler, { passive: true });
      window.addEventListener('orientationchange', resizeHandler, { passive: true });
      window.addEventListener('scroll', resizeHandler, { passive: true });
      this.cleanupListeners.push(() => {
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('orientationchange', resizeHandler);
        window.removeEventListener('scroll', resizeHandler);
      });

      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const viewportHandler = () => schedule();
        viewport.addEventListener('resize', viewportHandler);
        viewport.addEventListener('scroll', viewportHandler);
        this.cleanupListeners.push(() => {
          viewport.removeEventListener('resize', viewportHandler);
          viewport.removeEventListener('scroll', viewportHandler);
        });
      }
    });

    this.scrollSubscription = this.scrollDispatcher.scrolled(0).subscribe(() => this.scheduleUpdate());
  }

  private scheduleUpdate(): void {
    if (!this.matSelect.panelOpen) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.matSelect.panelOpen) {
          const matSelectAny = this.matSelect as unknown as {
            updatePosition?: () => void;
            updatePanelPosition?: () => void;
            panel?: { updatePosition?: () => void };
            _overlayDir?: { overlayRef?: { updatePosition?: () => void } };
          };

          matSelectAny.updatePosition?.();
          matSelectAny.updatePanelPosition?.();
          matSelectAny.panel?.updatePosition?.();
          matSelectAny._overlayDir?.overlayRef?.updatePosition?.();
        }
      });
    });
  }

  private stopMonitoring(): void {
    this.cleanupListeners.splice(0).forEach((teardown) => teardown());

    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
      this.scrollSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
