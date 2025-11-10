import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import {
  AuthSession,
  NavigationLink,
  ROLE_CONFIG,
  RoleConfig,
  RoleKey,
  UserAccount,
} from './auth.models';
import { MockAuthApi } from './mock-auth.api';

const TOKEN_STORAGE_KEY = 'auth_token';
const ACTIVE_ROLE_STORAGE_KEY = 'active_role_key';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  private activeRoleSubject = new BehaviorSubject<RoleKey | null>(null);
  private pendingStoredRole: RoleKey | null = this.getStoredRole();
  private initializeSubject = new ReplaySubject<void>(1);
  private initialization$?: Observable<UserAccount>;

  readonly session$ = this.sessionSubject.asObservable();
  readonly user$ = this.session$.pipe(map((session) => session?.user ?? null));
  readonly activeRole$ = this.activeRoleSubject.asObservable();
  readonly roles$ = this.user$.pipe(map((user) => user?.roles ?? []));

  constructor(private readonly api: MockAuthApi, private readonly router: Router) {
    // Kick off initialization lazily when requested
  }

  initialize(): Observable<UserAccount> {
    if (!this.initialization$) {
      this.initialization$ = this.initializeSubject.pipe(
        switchMap(() => this.api.fetchSession()),
        tap((session) => this.applySession(session)),
        map((session) => session.user),
        shareReplay(1),
      );
      // trigger first load
      this.initializeSubject.next();
    }
    return this.initialization$;
  }

  ensureInitialized(): Observable<UserAccount | null> {
    if (!this.initialization$) {
      return this.initialize().pipe(map((user) => user));
    }
    return this.initialization$;
  }

  get currentUser(): UserAccount | null {
    return this.sessionSubject.value?.user ?? null;
  }

  get activeRole(): RoleKey | null {
    return this.activeRoleSubject.value;
  }

  getToken(): string | null {
    return this.sessionSubject.value?.token ?? localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setActiveRole(role: RoleKey, navigate = true): void {
    const user = this.currentUser;
    if (!user || !user.roles.includes(role)) {
      return;
    }
    this.activeRoleSubject.next(role);
    this.storeRole(role);
    if (navigate) {
      const landing = ROLE_CONFIG[role]?.landingRoute ?? 'dashboard';
      void this.router.navigate(['/', landing]);
    }
  }

  clearActiveRole(): void {
    this.activeRoleSubject.next(null);
    localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    this.sessionSubject.next(null);
    this.clearActiveRole();
    void this.router.navigate(['/logout']);
  }

  hasRole(role: RoleKey): boolean {
    return this.currentUser?.roles.includes(role) ?? false;
  }

  isRouteAllowed(path: string): boolean {
    const activeRole = this.activeRoleSubject.value;
    if (!activeRole) {
      return false;
    }
    const normalized = this.normalizeRoute(path);
    const config = ROLE_CONFIG[activeRole];
    if (!config) {
      return false;
    }
    if (config.allowedRoutes.includes('*')) {
      return true;
    }
    return config.allowedRoutes.includes(normalized);
  }

  getNavigationLinks(): NavigationLink[] {
    const activeRole = this.activeRoleSubject.value;
    if (!activeRole) {
      return [];
    }
    return ROLE_CONFIG[activeRole]?.navigationLinks ?? [];
  }

  getRoleConfig(role: RoleKey): RoleConfig | null {
    return ROLE_CONFIG[role] ?? null;
  }

  getReadOnlyRoutes(role: RoleKey): string[] {
    return ROLE_CONFIG[role]?.readOnlyRoutes ?? [];
  }

  isRouteReadOnly(path: string): boolean {
    const role = this.activeRoleSubject.value;
    if (!role) {
      return false;
    }
    const normalized = this.normalizeRoute(path);
    return this.getReadOnlyRoutes(role).includes(normalized);
  }

  private applySession(session: AuthSession): void {
    this.sessionSubject.next(session);
    this.storeToken(session.token);
    const storedRole = this.pendingStoredRole;
    this.pendingStoredRole = null;
    const availableRoles = session.user.roles;
    if (storedRole && availableRoles.includes(storedRole)) {
      if (availableRoles.length === 1) {
        this.setActiveRole(storedRole, false);
        return;
      }
      this.clearActiveRole();
    } else if (storedRole) {
      this.clearActiveRole();
    }
    const resolvedRole = this.resolveInitialRole(session.user);
    if (resolvedRole) {
      this.setActiveRole(resolvedRole, false);
    } else {
      this.clearActiveRole();
    }
  }

  private resolveInitialRole(user: UserAccount): RoleKey | null {
    if (!user.roles.length) {
      return null;
    }
    if (user.roles.length === 1) {
      return user.roles[0];
    }
    return null;
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  private storeRole(role: RoleKey): void {
    localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
  }

  private getStoredRole(): RoleKey | null {
    const stored = localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY) as RoleKey | null;
    return stored ?? null;
  }

  private normalizeRoute(path: string): string {
    const normalized = path.replace(/^\//, '').split('?')[0];
    return normalized.length ? normalized : 'dashboard';
  }
}
