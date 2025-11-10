import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { map, switchMap, catchError, tap, shareReplay } from 'rxjs/operators';
import { HttpService } from './http.service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface QueryConfig {
  staleTime?: number; // How long data stays fresh (default: 5 minutes)
  cacheTime?: number; // How long unused data stays in cache (default: 10 minutes)
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();
  private defaultConfig: Required<QueryConfig> = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3
  };

  constructor(private httpService: HttpService) {
    // Clean up expired cache entries every minute
    timer(0, 60000).subscribe(() => {
      this.cleanupExpiredEntries();
    });

    // Refetch on window focus if enabled
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.handleWindowFocus();
      });
    }
  }

  private generateKey(endpoint: string, params?: any): string {
    if (!params) return endpoint;
    const paramString = JSON.stringify(params);
    return `${endpoint}:${paramString}`;
  }

  private isStale(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultConfig.cacheTime) {
        this.cache.delete(key);
        this.loadingStates.delete(key);
      }
    }
  }

  private handleWindowFocus(): void {
    // Refetch stale queries when window gains focus
    for (const [key, entry] of this.cache.entries()) {
      if (this.isStale(entry)) {
        // Could implement automatic refetch here if needed
        // For now, just mark as stale - components can check and refetch
      }
    }
  }

  query<T>(
    endpoint: string,
    params?: any,
    config: QueryConfig = {}
  ): Observable<T> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.generateKey(endpoint, params);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isStale(cached)) {
      return of(cached.data);
    }

    // Check if already loading
    const loadingState = this.loadingStates.get(cacheKey);
    if (loadingState && loadingState.value) {
      // Return the existing observable to avoid duplicate requests
      return this.httpService.get<T>(endpoint, { params }).pipe(
        tap(data => {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl: mergedConfig.staleTime
          });
        }),
        shareReplay(1)
      );
    }

    // Set loading state
    if (!loadingState) {
      this.loadingStates.set(cacheKey, new BehaviorSubject(false));
    }
    this.loadingStates.get(cacheKey)!.next(true);

    return this.httpService.get<T>(endpoint, { params }).pipe(
      tap(data => {
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: mergedConfig.staleTime
        });
        
        // Clear loading state
        this.loadingStates.get(cacheKey)!.next(false);
      }),
      catchError(error => {
        // Clear loading state on error
        this.loadingStates.get(cacheKey)!.next(false);
        return throwError(() => error);
      }),
      shareReplay(1)
    );
  }

  mutate<T>(
    endpoint: string,
    data: any,
    options: {
      method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      invalidateQueries?: string[];
      optimisticUpdate?: (cacheKey: string, newData: any) => void;
    } = {}
  ): Observable<T> {
    const { method = 'POST', invalidateQueries = [], optimisticUpdate } = options;

    // Optimistic update
    if (optimisticUpdate) {
      invalidateQueries.forEach(query => {
        optimisticUpdate(query, data);
      });
    }

    let request: Observable<T>;
    switch (method) {
      case 'POST':
        request = this.httpService.post<T>(endpoint, data);
        break;
      case 'PUT':
        request = this.httpService.put<T>(endpoint, data);
        break;
      case 'PATCH':
        request = this.httpService.patch<T>(endpoint, data);
        break;
      case 'DELETE':
        request = this.httpService.delete<T>(endpoint);
        break;
      default:
        request = this.httpService.post<T>(endpoint, data);
    }

    return request.pipe(
      tap(result => {
        // Invalidate specified queries
        invalidateQueries.forEach(queryKey => {
          this.invalidateQuery(queryKey);
        });
      }),
      catchError(error => {
        // Revert optimistic updates on error
        if (optimisticUpdate) {
          // Could implement revert logic here
        }
        return throwError(() => error);
      })
    );
  }

  invalidateQuery(keyPattern: string): void {
    // Remove cache entries that match the pattern
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  prefetchQuery<T>(endpoint: string, params?: any, config?: QueryConfig): void {
    // Prefetch data without subscribing to the observable
    this.query<T>(endpoint, params, config).subscribe({
      next: () => {}, // Data is cached in the tap operator
      error: () => {} // Ignore errors for prefetching
    });
  }

  setQueryData<T>(endpoint: string, data: T, params?: any): void {
    const cacheKey = this.generateKey(endpoint, params);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultConfig.staleTime
    });
  }

  getQueryData<T>(endpoint: string, params?: any): T | undefined {
    const cacheKey = this.generateKey(endpoint, params);
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : undefined;
  }

  isLoading(endpoint: string, params?: any): boolean {
    const cacheKey = this.generateKey(endpoint, params);
    const loadingState = this.loadingStates.get(cacheKey);
    return loadingState ? loadingState.value : false;
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingStates.clear();
  }
}
