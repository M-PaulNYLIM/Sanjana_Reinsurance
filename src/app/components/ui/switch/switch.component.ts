import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../../../../lib/utils';
@Component({
    selector: 'ui-switch',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SwitchComponent),
            multi: true,
        },
    ],
    templateUrl: "./switch.component.html",
    styleUrls: ["./switch.component.scss"]
})
export class SwitchComponent implements ControlValueAccessor {
    @Input()
    checked: boolean = false;
    @Input()
    disabled: boolean = false;
    @Input()
    class?: string;
    @Output()
    checkedChange = new EventEmitter<boolean>();
    private onChange = (value: boolean) => { };
    private onTouched = () => { };
    writeValue(value: boolean): void {
        this.checked = value;
    }
    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    toggle(): void {
        if (!this.disabled) {
            this.checked = !this.checked;
            this.onChange(this.checked);
            this.onTouched();
            this.checkedChange.emit(this.checked);
        }
    }
    getSwitchClasses(): string {
        return cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50', this.checked ? 'bg-primary' : 'bg-input', this.class);
    }
    getThumbClasses(): string {
        return cn('pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform', this.checked ? 'translate-x-5' : 'translate-x-0');
    }
}
