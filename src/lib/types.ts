// Basic component variant types
export type ComponentVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ComponentSize = 'default' | 'sm' | 'lg' | 'icon';

// Button types
export interface ButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  class?: string;
}

// Input types
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  class?: string;
}

// Card types
export interface CardProps {
  class?: string;
}

// Toast types
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  active?: boolean;
}

// File upload types
export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Dashboard data types
export interface MetricCard {
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon?: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Reinsurance data types
export interface ReinsurancePolicy {
  id: string;
  policyNumber: string;
  insuredName: string;
  coverage: string;
  premium: number;
  deductible: number;
  limit: number;
  effectiveDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  riskCategory: string;
  broker: string;
  location: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => string;
  class?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
  };
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

// Pagination response
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
  };
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
}

// Theme types
export type Theme = 'light' | 'dark';

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
