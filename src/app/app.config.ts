import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';

// Import interceptors
import {
  AuthInterceptor,
  ErrorInterceptor,
  LoadingInterceptor,
  RetryInterceptor,
  CacheInterceptor,
  ResponseTransformerInterceptor,
  CorsInterceptor,
  TimingInterceptor,
  VersioningInterceptor,
  LoadingService,
} from '../services/http-interceptors.service';

// Import data services
import {
  DataService,
  ReinsuranceDataService,
  DashboardDataService,
  FileUploadService,
} from '../services/data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideNativeDateAdapter(),

    // Services
    LoadingService,
    DataService,
    ReinsuranceDataService,
    DashboardDataService,
    FileUploadService,

    // HTTP Interceptors (order matters - they are applied in sequence)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: VersioningInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CorsInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RetryInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseTransformerInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
};
