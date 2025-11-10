import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function for creating variants similar to class-variance-authority
export function createVariants<T extends Record<string, Record<string, string>>>(
  config: {
    base?: string;
    variants?: T;
    defaultVariants?: { [K in keyof T]?: keyof T[K] };
  }
) {
  return (props?: { [K in keyof T]?: keyof T[K] } & { class?: string }) => {
    const base = config.base || "";
    let classes = [base];
    
    if (config.variants && props) {
      for (const [variantKey, variantValue] of Object.entries(props)) {
        if (variantKey === "class") continue;
        
        const variant = config.variants[variantKey];
        if (variant && variantValue && variant[variantValue as string]) {
          classes.push(variant[variantValue as string]);
        }
      }
    }
    
    // Apply default variants if not provided
    if (config.defaultVariants) {
      for (const [key, defaultValue] of Object.entries(config.defaultVariants)) {
        if (!props || !(key in props)) {
          const variant = config.variants?.[key];
          if (variant && defaultValue && variant[defaultValue as string]) {
            classes.push(variant[defaultValue as string]);
          }
        }
      }
    }
    
    if (props?.class) {
      classes.push(props.class);
    }
    
    return cn(...classes);
  };
}

// Format date utilities
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', options);
}

// Format currency utilities
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format percentage utilities
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
