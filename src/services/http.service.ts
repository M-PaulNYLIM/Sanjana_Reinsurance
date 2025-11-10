import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse } from '../lib/types';
import { environment } from '../environments/environment.dev';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // private readonly baseUrl =environment.apiUrl;
   private readonly baseUrl ='';

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('HTTP Error:', error);
    return throwError(() => error);
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  get<T>(endpoint: string, options?: RequestOptions): Observable<any> {
    return this.http.get<ApiResponse<T>>(this.buildUrl(endpoint), options)
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, data: any, options?: RequestOptions): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(endpoint), data, options)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  put<T>(endpoint: string, data: any, options?: RequestOptions): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.buildUrl(endpoint), data, options)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  patch<T>(endpoint: string, data: any, options?: RequestOptions): Observable<T> {
    return this.http.patch<ApiResponse<T>>(this.buildUrl(endpoint), data, options)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.buildUrl(endpoint), options)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Specialized method for paginated responses
  getPaginated<T>(endpoint: string, options?: RequestOptions): Observable<PaginatedResponse<T>> {
    return this.http.get<PaginatedResponse<T>>(this.buildUrl(endpoint), options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // File upload method
  uploadFile(endpoint: string, file: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<any>>(this.buildUrl(endpoint), formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Multiple file upload
  uploadFiles(endpoint: string, files: File[], additionalData?: any): Observable<any> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<any>>(this.buildUrl(endpoint), formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
}
