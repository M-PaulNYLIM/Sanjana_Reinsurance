import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UploadStatus = 'Processed' | 'Failed';

export interface UploadHistoryRecord {
  id: string;
  filename: string;
  user: string;
  timestamp: Date;
  status: UploadStatus;
  size: number;
  weekKey?: string | null;
  blobUrl?: string; // for client-side download
}

@Injectable({ providedIn: 'root' })
export class UploadHistoryService {
  private readonly recordsSubject = new BehaviorSubject<UploadHistoryRecord[]>([]);
  readonly records$ = this.recordsSubject.asObservable();

  get records(): UploadHistoryRecord[] {
    return this.recordsSubject.value;
  }

  addFromFile(file: File, user: string, weekKey?: string | null, status: UploadStatus = 'Processed'): UploadHistoryRecord {
    const id = this.generateId();
    const blobUrl = URL.createObjectURL(file);
    const record: UploadHistoryRecord = {
      id,
      filename: file.name,
      user,
      timestamp: new Date(),
      status,
      size: file.size,
      weekKey: weekKey ?? null,
      blobUrl,
    };
    this.recordsSubject.next([record, ...this.recordsSubject.value]);
    return record;
  }

  triggerDownload(record: UploadHistoryRecord): void {
    // Prefer blobUrl when available
    if (record.blobUrl) {
      const a = document.createElement('a');
      a.href = record.blobUrl;
      a.download = record.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
