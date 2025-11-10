import { Component, Input, Output, EventEmitter, forwardRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
    selector: 'ui-input',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ],
    templateUrl: "./input.component.html",
    styleUrls: ["./input.component.scss"]
})
export class InputComponent implements ControlValueAccessor {
    @Input()
    type: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' = 'text';
    @Input()
    placeholder?: string;
    @Input()
    label?: string;
    @Input()
    appearance: 'fill' | 'outline' = 'outline';
    @Input()
    disabled: boolean = false;
    @Input()
    readonly: boolean = false;
    @Input()
    required: boolean = false;
    @Output()
    valueChange = new EventEmitter<string>();
    @Output()
    focused = new EventEmitter<void>();
    @Output()
    blurred = new EventEmitter<void>();
    @HostBinding('class')
    hostClass = 'block w-full';
    value: string = '';
    // ControlValueAccessor implementation
    private onChange = (value: string) => { };
    private onTouched = () => { };
    writeValue(value: string): void {
        this.value = value || '';
    }
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.onChange(this.value);
        this.valueChange.emit(this.value);
    }
    onBlur(): void {
        this.onTouched();
        this.blurred.emit();
    }
    onFocus(): void {
        this.focused.emit();
    }
}
