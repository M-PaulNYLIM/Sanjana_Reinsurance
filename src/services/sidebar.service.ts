import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponsiveService } from './responsive.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private openDesktopSubject = new BehaviorSubject<boolean>(true);
  private openMobileSubject = new BehaviorSubject<boolean>(false);

  public openDesktop$: Observable<boolean> = this.openDesktopSubject.asObservable();
  public openMobile$: Observable<boolean> = this.openMobileSubject.asObservable();

  // Combined state that considers device type
  public isOpen$!: Observable<boolean>;

  constructor(private responsiveService: ResponsiveService) {
    this.isOpen$ = combineLatest([
      this.openDesktop$,
      this.openMobile$,
      this.responsiveService.isMobile$,
    ]).pipe(map(([openDesktop, openMobile, isMobile]) => (isMobile ? openMobile : openDesktop)));
  }

  // Set desktop sidebar state
  setOpenDesktop(open: boolean): void {
    this.openDesktopSubject.next(open);
  }

  // Set mobile sidebar state
  setOpenMobile(open: boolean): void {
    this.openMobileSubject.next(open);
  }

  // Toggle desktop sidebar
  toggleDesktop(): void {
    this.setOpenDesktop(!this.openDesktopSubject.value);
  }

  // Toggle mobile sidebar
  toggleMobile(): void {
    this.setOpenMobile(!this.openMobileSubject.value);
  }

  // Toggle based on current device
  toggle(): void {
    if (this.responsiveService.isMobile()) {
      this.toggleMobile();
    } else {
      this.toggleDesktop();
    }
  }

  // Close both desktop and mobile
  closeAll(): void {
    this.setOpenDesktop(false);
    this.setOpenMobile(false);
  }

  // Get current state synchronously
  isOpenDesktop(): boolean {
    return this.openDesktopSubject.value;
  }

  isOpenMobile(): boolean {
    return this.openMobileSubject.value;
  }

  isOpen(): boolean {
    return this.responsiveService.isMobile() ? this.isOpenMobile() : this.isOpenDesktop();
  }
}
