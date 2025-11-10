import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu/dropdown-menu.component';
import { DropdownMenuItemComponent } from '../dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';

export interface SelectDropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'ui-select-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownMenuComponent, DropdownMenuItemComponent],
  templateUrl: './select-dropdown.component.html',
  styleUrls: ['./select-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDropdownComponent),
      multi: true,
    },
  ],
})
export class SelectDropdownComponent implements ControlValueAccessor {
  @Input() options: SelectDropdownOption[] = [];
  @Input() placeholder = 'Select option';
  @Input() showEmptyOption = false;
  @Input() emptyLabel = 'All';
  @Input() emptyValue: string = '';
  @Input() align: 'start' | 'center' | 'end' = 'start';

  @ViewChild(DropdownMenuComponent) dropdownMenu?: DropdownMenuComponent;

  protected value: string | null = null;
  protected disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    if (value === undefined || value === null) {
      this.value = this.showEmptyOption ? this.emptyValue : null;
    } else {
      this.value = value;
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected toggleOption(value: string | null): void {
    if (this.disabled) {
      return;
    }

    const nextValue = value ?? (this.showEmptyOption ? this.emptyValue : null);
    this.value = nextValue;
    this.onChange(this.value);
    this.onTouched();
    this.dropdownMenu?.closeDropdown();
  }

  protected isSelected(optionValue: string | null): boolean {
    if (optionValue === null) {
      return this.value === null || this.value === this.emptyValue;
    }
    return optionValue === this.value;
  }

  protected get displayLabel(): string {
    const active = this.options.find((option) => option.value === this.value);

    if (active) {
      return active.label;
    }

    if (this.showEmptyOption && (this.value === this.emptyValue || this.value === null)) {
      return this.emptyLabel;
    }

    return this.placeholder;
  }

  protected get isPlaceholder(): boolean {
    const active = this.options.some((option) => option.value === this.value);
    if (active) {
      return false;
    }

    if (this.showEmptyOption && (this.value === this.emptyValue || this.value === null)) {
      return this.emptyLabel === this.placeholder;
    }

    return true;
  }

  protected trackByValue(_: number, option: SelectDropdownOption): string {
    return option.value;
  }
}
