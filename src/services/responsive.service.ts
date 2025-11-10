import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly TABLET_BREAKPOINT = 1024;
  
  private windowSizeSubject = new BehaviorSubject<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  public windowSize$: Observable<{ width: number; height: number }> = this.windowSizeSubject.asObservable();

  public isMobile$: Observable<boolean> = this.windowSize$.pipe(
    map(size => size.width < this.MOBILE_BREAKPOINT)
  );

  public isTablet$: Observable<boolean> = this.windowSize$.pipe(
    map(size => size.width >= this.MOBILE_BREAKPOINT && size.width < this.TABLET_BREAKPOINT)
  );

  public isDesktop$: Observable<boolean> = this.windowSize$.pipe(
    map(size => size.width >= this.TABLET_BREAKPOINT)
  );

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen to window resize events
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          startWith(null)
        )
        .subscribe(() => {
          this.updateWindowSize();
        });
    }
  }

  private updateWindowSize(): void {
    if (typeof window !== 'undefined') {
      this.windowSizeSubject.next({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  }

  // Synchronous methods for immediate checks
  getCurrentWindowSize(): { width: number; height: number } {
    return this.windowSizeSubject.value;
  }

  isMobile(): boolean {
    return this.getCurrentWindowSize().width < this.MOBILE_BREAKPOINT;
  }

  isTablet(): boolean {
    const width = this.getCurrentWindowSize().width;
    return width >= this.MOBILE_BREAKPOINT && width < this.TABLET_BREAKPOINT;
  }

  isDesktop(): boolean {
    return this.getCurrentWindowSize().width >= this.TABLET_BREAKPOINT;
  }

  // Check if a specific breakpoint is active
  isBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
    switch (breakpoint) {
      case 'mobile':
        return this.isMobile();
      case 'tablet':
        return this.isTablet();
      case 'desktop':
        return this.isDesktop();
      default:
        return false;
    }
  }

  // Get current breakpoint
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }
}
