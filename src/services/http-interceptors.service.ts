import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, retry, tap, finalize } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { AuthService } from '../app/auth/auth.service';

// Loading state service
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCount = 0;
  private loadingState = false;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this.loadingSubject.asObservable();

  get isLoading(): boolean {
    return this.loadingState;
  }

  setLoading(loading: boolean): void {
    if (loading) {
      this.loadingCount++;
    } else {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
    }

    this.loadingState = this.loadingCount > 0;
    if (typeof window !== 'undefined' && 'queueMicrotask' in window) {
      queueMicrotask(() => this.loadingSubject.next(this.loadingState));
    } else {
      setTimeout(() => this.loadingSubject.next(this.loadingState), 0);
    }
  }
}

// Authentication interceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only use Basic Auth for reinsurance component API endpoints
    // if (req.url.includes('/api/reinsurancerates/')) {
    //   const username = 'user'; // Replace with your username
    //   const password = 'c400e5ae-384a-4d10-91c6-d12ccb22f1e1'; // Replace with your password
    //   const authHeader = 'Basic ' + btoa(`${username}:${password}`);
    //   console.log('Adding Basic Auth header:', authHeader, 'to', req.url);
    //   const authReq = req.clone({
    //     headers: req.headers.set('Authorization', authHeader),
    //   });
    //   return next.handle(authReq);
    // }

    // Default: use Bearer token if available
    // const token = this.auth.getToken();
    // if (token) {
    //   const authReq = req.clone({
    //     headers: req.headers.set('Authorization', `Bearer ${token}`),
    //   });
    //   return next.handle(authReq);
    // }

    return next.handle(req);
  }
}

// Error handling interceptor
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly toastService: ToastService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = 'Bad Request: ' + (error.error?.message || 'Invalid request');
              break;
            case 401:
              errorMessage = 'Unauthorized: Please log in again';
              this.handleUnauthorized();
              break;
            case 403:
              errorMessage = 'Forbidden: You do not have permission to access this resource';
              this.handleForbidden();
              break;
            case 404:
              errorMessage = 'Not Found: The requested resource was not found';
              break;
            case 429:
              errorMessage = 'Too Many Requests: Please try again later';
              break;
            case 500:
              errorMessage = 'Internal Server Error: Please try again later';
              break;
            case 502:
              errorMessage = 'Bad Gateway: Server is temporarily unavailable';
              break;
            case 503:
              errorMessage = 'Service Unavailable: Please try again later';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
          }
        }

        // Show error toast for user-facing errors
        if (!req.url.includes('/silent') && error.status !== 401) {
          this.toastService.error(errorMessage);
        }

        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private handleUnauthorized(): void {
    this.auth.clearActiveRole();
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    void this.router.navigate(['/select-role']);
  }

  private handleForbidden(): void {
    this.auth.clearActiveRole();
    void this.router.navigate(['/select-role']);
  }
}

// Loading interceptor
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't show loading for certain requests
    if (req.url.includes('/silent') || req.headers.has('X-Skip-Loading')) {
      return next.handle(req);
    }

    this.loadingService.setLoading(true);

    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.setLoading(false);
      }),
    );
  }
}

// Retry interceptor with exponential backoff
@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second base delay

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only retry GET requests and specific endpoints
    if (req.method !== 'GET' || req.url.includes('/no-retry')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      retry({
        count: this.maxRetries,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Don't retry on certain error codes
          if (error.status === 401 || error.status === 403 || error.status === 404) {
            throw error;
          }

          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, retryCount);
          console.log(
            `Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`,
          );

          return timer(delay);
        },
      }),
    );
  }
}

// Caching interceptor
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
  private readonly cacheValidityTime = 5 * 60 * 1000; // 5 minutes

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Skip caching for certain requests
    if (req.headers.has('X-Skip-Cache') || req.url.includes('/no-cache')) {
      return next.handle(req);
    }

    const cacheKey = this.getCacheKey(req);
    const cachedResponse = this.cache.get(cacheKey);

    // Return cached response if valid
    if (cachedResponse && this.isCacheValid(cachedResponse.timestamp)) {
      console.log('Returning cached response for:', req.url);
      return new Observable((observer) => {
        observer.next(cachedResponse.response.clone());
        observer.complete();
      });
    }

    // Make request and cache response
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.set(cacheKey, {
            response: event.clone(),
            timestamp: Date.now(),
          });
        }
      }),
    );
  }

  private getCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.urlWithParams}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheValidityTime;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Response transformer interceptor
@Injectable()
export class ResponseTransformerInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Transform response data if needed
          this.transformResponse(event.body, req.url);
        }
      }),
    );
  }

  private transformResponse(body: any, url: string): any {
    // Add any response transformations here
    // For example, convert date strings to Date objects
    if (body && typeof body === 'object') {
      return this.transformDates(body);
    }
    return body;
  }

  private transformDates(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Check if string matches ISO date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (dateRegex.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDates(item));
    }

    if (typeof obj === 'object') {
      const transformed: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          transformed[key] = this.transformDates(obj[key]);
        }
      }
      return transformed;
    }

    return obj;
  }
}

// CORS interceptor
@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add CORS headers for cross-origin requests
    const corsRequest = req.clone({
      headers: req.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .set('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
    });

    return next.handle(corsRequest);
  }
}

// Request timing interceptor for performance monitoring
@Injectable()
export class TimingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`Request to ${req.url} took ${duration}ms`);

          // Log slow requests
          if (duration > 2000) {
            console.warn(`Slow request detected: ${req.url} took ${duration}ms`);
          }
        }
      }),
    );
  }
}

// API versioning interceptor
@Injectable()
export class VersioningInterceptor implements HttpInterceptor {
  private readonly apiVersion = 'v1';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add API version header
    const versionedRequest = req.clone({
      headers: req.headers.set('API-Version', this.apiVersion),
    });

    return next.handle(versionedRequest);
  }
}
