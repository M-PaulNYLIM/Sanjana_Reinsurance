import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AuthSession, UserRole } from './auth.models';

@Injectable({ providedIn: 'root' })
export class MockAuthApi {
  fetchSession(): Observable<AuthSession> {
    const session: AuthSession = {
      token: 'mock-access-token-123',
      user: {
        id: 'user-001',
        email: 'lauren.cocchiarelli@example.com',
        displayName: 'Lauren M. Cocchiarelli',
        // roles: [UserRole.Admin, UserRole.Analyst],
         roles: [UserRole.Admin],
        defaultRole: UserRole.Analyst,
      },
    };

    return of(session).pipe(delay(200));
  }
}
