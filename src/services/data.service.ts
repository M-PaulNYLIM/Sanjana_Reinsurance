import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, shareReplay, retry, switchMap } from 'rxjs/operators';

// Types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface QueryOptions {
  cacheTime?: number; // Cache duration in milliseconds
  staleTime?: number; // Time before data is considered stale
  retry?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private cache = new Map<string, CacheEntry<any>>();
  private loadingStates = new Map<string, Observable<any>>();
  private readonly baseUrl = '/api'; // Configure based on environment
  private readonly defaultCacheTime = 5 * 60 * 1000; // 5 minutes
  private readonly defaultStaleTime = 0; // Immediately stale
  private readonly defaultRetry = 3;
  private readonly defaultRetryDelay = 1000;

  // Loading states for UI
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Error states
  private errorSubject = new BehaviorSubject<any>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cleanup expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  /**
   * Generic query method that replaces useQuery from React Query
   */
  query<T>(
    queryKey: string | string[],
    queryFn: () => Observable<T>,
    options: QueryOptions = {},
  ): Observable<T> {
    const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
    const cacheTime = options.cacheTime ?? this.defaultCacheTime;
    const staleTime = options.staleTime ?? this.defaultStaleTime;

    // Check cache first
    const cachedData = this.getCachedData<T>(key, staleTime);
    if (cachedData) {
      return of(cachedData);
    }

    // Check if request is already in flight
    if (this.loadingStates.has(key)) {
      return this.loadingStates.get(key)!;
    }

    // Create new request
    const request = queryFn().pipe(
      retry(options.retry ?? this.defaultRetry),
      tap((data) => {
        // Cache successful response
        this.setCacheData(key, data, cacheTime);
        this.loadingStates.delete(key);
        this.setLoading(false);
        this.setError(null);
      }),
      catchError((error) => {
        this.loadingStates.delete(key);
        this.setLoading(false);
        this.setError(error);
        return throwError(() => error);
      }),
      shareReplay(1),
    );

    this.loadingStates.set(key, request);
    this.setLoading(true);

    return request;
  }

  /**
   * Mutation method that replaces useMutation from React Query
   */
  mutate<TData, TVariables = void>(
    mutationFn: (variables: TVariables) => Observable<TData>,
    options: {
      onSuccess?: (data: TData, variables: TVariables) => void;
      onError?: (error: any, variables: TVariables) => void;
      invalidateQueries?: string[];
    } = {},
  ) {
    return {
      mutate: (variables: TVariables) => {
        this.setLoading(true);
        this.setError(null);

        return mutationFn(variables).pipe(
          tap((data) => {
            this.setLoading(false);
            options.onSuccess?.(data, variables);

            // Invalidate specified queries
            if (options.invalidateQueries) {
              this.invalidateQueries(options.invalidateQueries);
            }
          }),
          catchError((error) => {
            this.setLoading(false);
            this.setError(error);
            options.onError?.(error, variables);
            return throwError(() => error);
          }),
        );
      },
    };
  }

  /**
   * GET request with caching
   */
  get<T>(url: string, params?: any, options: QueryOptions = {}): Observable<T> {
    const queryKey = this.buildQueryKey('GET', url, params);
    return this.query(
      queryKey,
      () => this.http.get<T>(`${this.baseUrl}${url}`, { params: this.buildHttpParams(params) }),
      options,
    );
  }

  /**
   * POST request (mutation)
   */
  post<T>(
    url: string,
    body?: any,
    options: {
      invalidateQueries?: string[];
      headers?: HttpHeaders;
    } = {},
  ): Observable<T> {
    const mutation = this.mutate<T, any>(
      (data) => this.http.post<T>(`${this.baseUrl}${url}`, data, { headers: options.headers }),
      {
        invalidateQueries: options.invalidateQueries,
      },
    );

    return mutation.mutate(body);
  }

  /**
   * PUT request (mutation)
   */
  put<T>(
    url: string,
    body?: any,
    options: {
      invalidateQueries?: string[];
      headers?: HttpHeaders;
    } = {},
  ): Observable<T> {
    const mutation = this.mutate<T, any>(
      (data) => this.http.put<T>(`${this.baseUrl}${url}`, data, { headers: options.headers }),
      {
        invalidateQueries: options.invalidateQueries,
      },
    );

    return mutation.mutate(body);
  }

  /**
   * DELETE request (mutation)
   */
  delete<T>(
    url: string,
    options: {
      invalidateQueries?: string[];
      headers?: HttpHeaders;
    } = {},
  ): Observable<T> {
    const mutation = this.mutate<T, void>(
      () => this.http.delete<T>(`${this.baseUrl}${url}`, { headers: options.headers }),
      {
        invalidateQueries: options.invalidateQueries,
      },
    );

    return mutation.mutate(undefined as void);
  }

  /**
   * Upload file with progress tracking
   */
  uploadFile(url: string, file: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post(`${this.baseUrl}${url}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Invalidate cache for specific queries
   */
  invalidateQueries(queryKeys: string[]): void {
    queryKeys.forEach((key) => {
      // Remove exact matches and pattern matches
      for (const cacheKey of this.cache.keys()) {
        if (cacheKey === key || cacheKey.startsWith(`${key}:`)) {
          this.cache.delete(cacheKey);
        }
      }
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingStates.clear();
  }

  /**
   * Prefetch data (similar to React Query's prefetchQuery)
   */
  prefetch<T>(
    queryKey: string | string[],
    queryFn: () => Observable<T>,
    options: QueryOptions = {},
  ): Observable<T> {
    return this.query(queryKey, queryFn, options);
  }

  /**
   * Get cached data if available and not stale
   */
  private getCachedData<T>(key: string, staleTime: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now > entry.expiresAt;
    const isStale = now > entry.timestamp + staleTime;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    // Return cached data even if stale (background refresh can be implemented)
    return entry.data;
  }

  /**
   * Cache data with expiration
   */
  private setCacheData<T>(key: string, data: T, cacheTime: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + cacheTime,
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Build query key for caching
   */
  private buildQueryKey(method: string, url: string, params?: any): string {
    const baseKey = `${method}:${url}`;
    if (!params) {
      return baseKey;
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return `${baseKey}?${sortedParams}`;
  }

  /**
   * Build HTTP params from object
   */
  private buildHttpParams(params?: any): HttpParams {
    if (!params) {
      return new HttpParams();
    }

    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return httpParams;
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set error state
   */
  private setError(error: any): void {
    this.errorSubject.next(error);
  }
}

// Specific service for Reinsurance data
@Injectable({
  providedIn: 'root',
})
export class ReinsuranceDataService {
  constructor(private dataService: DataService) {}

  /**
   * Get reinsurer data
   */
  getReinsurerData(params?: { search?: string; status?: string }): Observable<any[]> {
    return this.dataService.get('/reinsurers', params, {
      cacheTime: 10 * 60 * 1000, // 10 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Get policy data
   */
  getPolicyData(params?: { search?: string; status?: string; firm?: string }): Observable<any[]> {
    return this.dataService.get('/policies', params, {
      cacheTime: 10 * 60 * 1000, // 10 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Upload reinsurer file
   */
  uploadReinsurerFile(file: File): Observable<any> {
    return this.dataService.uploadFile('/reinsurers/upload', file);
  }

  /**
   * Update treaty
   */
  updateTreaty(treatyId: string, data: any): Observable<any> {
    return this.dataService.put(`/reinsurers/${treatyId}`, data, {
      invalidateQueries: ['GET:/reinsurers'],
    });
  }

  /**
   * Delete treaty
   */
  deleteTreaty(treatyId: string): Observable<any> {
    return this.dataService.delete(`/reinsurers/${treatyId}`, {
      invalidateQueries: ['GET:/reinsurers'],
    });
  }
}

// Dashboard data service
@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  constructor(private dataService: DataService) {}

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): Observable<any> {
    return this.dataService.get(
      '/dashboard/metrics',
      {},
      {
        cacheTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 1 * 60 * 1000, // 1 minute
      },
    );
  }

  /**
   * Get chart data
   */
  getChartData(chartType: string, dateRange?: string): Observable<any> {
    return this.dataService.get(
      `/dashboard/charts/${chartType}`,
      { dateRange },
      {
        cacheTime: 15 * 60 * 1000, // 15 minutes
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    );
  }

  /**
   * Get recent activity
   */
  getRecentActivity(limit?: number): Observable<any[]> {
    return this.dataService.get(
      '/dashboard/activity',
      { limit },
      {
        cacheTime: 2 * 60 * 1000, // 2 minutes
        staleTime: 30 * 1000, // 30 seconds
      },
    );
  }
}

// File upload service
@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private dataService: DataService) {}

  /**
   * Upload file with progress
   */
  uploadFile(file: File, category?: string): Observable<any> {
    return this.dataService.uploadFile('/files/upload', file, { category });
  }

  /**
   * Get upload history
   */
  getUploadHistory(params?: { page?: number; limit?: number }): Observable<any> {
    return this.dataService.get('/files/history', params, {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  }

  /**
   * Delete uploaded file
   */
  deleteFile(fileId: string): Observable<any> {
    return this.dataService.delete(`/files/${fileId}`, {
      invalidateQueries: ['GET:/files/history'],
    });
  }
}
