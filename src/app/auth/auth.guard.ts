import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.auth.initialize().pipe(map(() => this.evaluateAccess(route, state)));
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }

  private evaluateAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const user = this.auth.currentUser;
    if (!user || !user.roles.length) {
      return this.router.createUrlTree(['/logout']);
    }

    const isRoleSelectionRoute = route.routeConfig?.path === 'select-role';
    const activeRole = this.auth.activeRole;

    if (!activeRole) {
      if (user.roles.length === 1) {
        this.auth.setActiveRole(user.roles[0], false);
        return true;
      }
      if (isRoleSelectionRoute) {
        return true;
      }
      return this.router.createUrlTree(['/select-role'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (isRoleSelectionRoute) {
      if (user.roles.length > 1) {
        return true;
      }
      const landing = this.auth.getRoleConfig(activeRole)?.landingRoute ?? 'dashboard';
      return this.router.createUrlTree(['/', landing]);
    }

    if (!this.auth.isRouteAllowed(state.url)) {
      const landing = this.auth.getRoleConfig(activeRole)?.landingRoute ?? 'dashboard';
      return this.router.createUrlTree(['/', landing]);
    }

    return true;
  }
}
