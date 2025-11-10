import { Routes } from '@angular/router';


export enum UserRole {
  Admin = 'admin',
  Analyst = 'analyst',
}

export type RoleKey = `${UserRole}`;

export interface RoleConfig {
  key: RoleKey;
  label: string;
  description: string;
  landingRoute: string;
  allowedRoutes: string[];
  readOnlyRoutes?: string[];
  navigationLinks: NavigationLink[];
}

export interface NavigationLink {
  label: string;
  path: string;
}

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  roles: RoleKey[];
  defaultRole?: RoleKey;
}

export interface AuthSession {
  token: string;
  user: UserAccount;
}

export interface RouteRoleData {
  allowedRoles?: RoleKey[];
  redirectOnDeny?: string;
}

export type RoleAwareRoute = Routes[number] & { data?: RouteRoleData };

export const ROLE_CONFIG: Record<RoleKey, RoleConfig> = {
  [UserRole.Admin]: {
    key: UserRole.Admin,
    label: 'Administrator',
    description: 'Full platform access with management capabilities.',
    landingRoute: 'dashboard',
    allowedRoutes: [
      'dashboard',
      'upload',
      'upload-history',
      'reinsurance',
      'reinsurance-rates',
      'policy-details',
      'profile',
      'logout',
    ],
    navigationLinks: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Reinsurance Rates', path: '/reinsurance' },
      { label: 'Policy Details', path: '/policy-details' },
      // { label: 'File Upload', path: '/upload' }
    ],
  },
  [UserRole.Analyst]: {
    key: UserRole.Analyst,
    label: 'Analyst',
    description: 'Read analytics and manage uploads history.',
    landingRoute: 'dashboard',
    allowedRoutes: [
      'dashboard',
      'upload',
      'upload-history',
      'logout',
    ],
    readOnlyRoutes: ['upload-history'],
    navigationLinks: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'File Upload', path: '/upload' }
    ],
  },
};
