import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Toast } from '../../../../lib/types';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'ui-toaster',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  onToastDismissed(toastId: string): void {
    this.toastService.dismiss(toastId);
  }
}
