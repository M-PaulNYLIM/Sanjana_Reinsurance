import { Routes } from '@angular/router';


import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FileUploadComponent } from './pages/file-upload/file-upload.component';
import { ReinsuranceComponent } from './pages/reinsurance/reinsurance.component';
import { UploadHistoryComponent } from './pages/upload-history/upload-history.component';
import { ReinsuranceRatesComponent } from './pages/reinsurance-rates/reinsurance-rates.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { UserRole } from './auth/auth.models';
import { PolicyDetailsComponent } from './pages/policy-details/policy-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'select-role',
  },
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard, RoleGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { allowedRoles: [UserRole.Admin, UserRole.Analyst] },
      },
      {
        path: 'upload',
        component: FileUploadComponent,
        data: { allowedRoles: [UserRole.Admin, UserRole.Analyst] },
      },
      {
        path: 'reinsurance',
        component: ReinsuranceComponent,
        data: { allowedRoles: [UserRole.Admin] },
      },
      {
        path: 'reinsurance-rates',
        component: ReinsuranceRatesComponent,
        data: { allowedRoles: [UserRole.Admin] },
      },
      {
        path: 'policy-details',
        component: PolicyDetailsComponent,
        data: { allowedRoles: [UserRole.Admin] },
      },
      {
        path: 'upload-history',
        component: UploadHistoryComponent,
        data: { allowedRoles: [UserRole.Admin, UserRole.Analyst] },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { allowedRoles: [UserRole.Admin] },
      },
      {
        path: 'logout',
        component: LogoutComponent,
        data: { allowedRoles: [UserRole.Admin, UserRole.Analyst] },
      },
    ],
  },
  {
    path: 'select-role',
    canActivate: [AuthGuard],
    component: RoleSelectionComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
