import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast } from '../lib/types';
import { generateId } from '../lib/utils';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private toasts: Toast[] = [];

  constructor() {}

  private updateToasts(): void {
    this.toastsSubject.next([...this.toasts]);
  }

  toast(toast: Omit<Toast, 'id'>): void {
    const newToast: Toast = {
      id: generateId(),
      duration: 5000,
      variant: 'default',
      ...toast
    };

    this.toasts.push(newToast);
    this.updateToasts();

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(newToast.id);
      }, newToast.duration);
    }
  }

  success(title: string, description?: string): void {
    this.toast({
      title,
      description,
      variant: 'success'
    });
  }

  error(title: string, description?: string): void {
    this.toast({
      title,
      description,
      variant: 'destructive',
      duration: 0 // Don't auto-dismiss errors
    });
  }

  warning(title: string, description?: string): void {
    this.toast({
      title,
      description,
      variant: 'warning'
    });
  }

  info(title: string, description?: string): void {
    this.toast({
      title,
      description,
      variant: 'default'
    });
  }

  dismiss(toastId: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== toastId);
    this.updateToasts();
  }

  dismissAll(): void {
    this.toasts = [];
    this.updateToasts();
  }

  update(toastId: string, updates: Partial<Toast>): void {
    const toastIndex = this.toasts.findIndex(toast => toast.id === toastId);
    if (toastIndex !== -1) {
      this.toasts[toastIndex] = { ...this.toasts[toastIndex], ...updates };
      this.updateToasts();
    }
  }
}
