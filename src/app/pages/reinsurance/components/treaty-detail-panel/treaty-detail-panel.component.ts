import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { ReinsurerData } from '../../reinsurance.types';

@Component({
    selector: 'app-treaty-detail-panel',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
    templateUrl: './treaty-detail-panel.component.html',
    styleUrls: ['./treaty-detail-panel.component.scss'],
})
export class TreatyDetailPanelComponent {
    @Input() treaty: ReinsurerData | null = null;
    @Input() isEditing = false;
    @Input() editForm: FormGroup | null = null;
    @Input() details: { label: string; value: string }[] = [];
    @Input() canEdit = false;

    @Output() close = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();

    onClose(): void {
        this.close.emit();
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onSave(): void {
        this.save.emit();
    }
}
