import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent, CardContentComponent } from '../../components/ui/card';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { ProgressComponent } from '../../components/ui/progress/progress.component';
import { TabsComponent } from '../../components/ui/tabs/tabs/tabs.component';
import { TabsListComponent } from '../../components/ui/tabs/tabs-list/tabs-list.component';
// import { TabsTriggerComponent } from '../../components/ui/tabs/tabs-trigger/tabs-trigger.component';
import { TabsContentComponent } from '../../components/ui/tabs/tabs-content/tabs-content.component';
import { UploadHistoryComponent } from '../upload-history/upload-history.component';
import { ToastService } from '../../../services/toast.service';
import { generateId } from '../../../lib/utils';
import { UploadHistoryService } from '../../../services/upload-history.service';
import { AuthService } from '../../auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSelectPositionFixDirective } from '../../directives/mat-select-position-fix.directive';
interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    progress?: number;
    file?: File;
    uploadedAt?: Date;
    error?: string;
    weekKey: string; // selected week key this file is associated with
}

interface WeekOption {
    key: string;
    start: string;
    end: string;
    label: string;
}
@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardComponent,
        CardContentComponent,
        ButtonComponent,
        ProgressComponent,
        TabsComponent,
        // TabsListComponent,
        // TabsTriggerComponent,
        TabsContentComponent,
        UploadHistoryComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatSelectPositionFixDirective,
    ],
    templateUrl: "./file-upload.component.html",
    styleUrls: ["./file-upload.component.scss"]
})
export class FileUploadComponent implements OnInit {
    activeTab: string = 'upload';
    @ViewChild('fileInputRef')
    fileInputRef!: ElementRef<HTMLInputElement>;
    files: UploadedFile[] = [];
    dragActive = false;
    isUploading = false;
    weekOptions: WeekOption[] = [];
    monthOptions: WeekOption[] = [];
    periodType: 'Weekly' | 'Monthly' = 'Weekly';
    selectedWeekKey: string | null = null;
    filterQuery: string = '';

    private readonly MAX_TOTAL_UPLOAD_SIZE = 25 * 1024 * 1024;
    private readonly ALLOWED_MIME_TYPES = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    private readonly ALLOWED_EXTENSIONS = ['.xls', '.xlsx'];
    constructor(private toastService: ToastService, private readonly history: UploadHistoryService, private readonly auth: AuthService) { }
    ngOnInit(): void {
        this.weekOptions = this.generateLatestWeeks(5);
        this.monthOptions = this.generateLatestMonths(5);
        this.selectedWeekKey = null;
    }
    get totalSelectedSize(): number {
        return this.files.reduce((sum, file) => sum + file.size, 0);
    }
    get totalUploadLimitLabel(): string {
        return `${this.formatFileSize(this.totalSelectedSize)} / ${this.formatFileSize(this.MAX_TOTAL_UPLOAD_SIZE)}`;
    }
    get pendingFiles(): UploadedFile[] {
        return this.files.filter((f) => f.status === 'pending');
    }
    get uploadingFiles(): UploadedFile[] {
        return this.files.filter((f) => f.status === 'uploading');
    }
    get uploadedFiles(): UploadedFile[] {
        return this.files.filter((f) => f.status === 'uploaded');
    }
    get errorFiles(): UploadedFile[] {
        return this.files.filter((f) => f.status === 'error');
    }
    getDropZoneClasses(): string {
        return `relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer max-[991px]:flex max-[991px]:flex-col max-[991px]:items-center ${this.dragActive
            ? 'border-nyl-blue bg-upload-drop-zone'
            : 'border-gray-300 bg-upload-drop-zone hover:border-nyl-blue'}`;
    }
    // Filtered views by search query
    private matchesQuery(f: UploadedFile): boolean {
        const q = this.filterQuery.trim().toLowerCase();
        if (!q) return true;
        return f.name.toLowerCase().includes(q);
    }
    get filteredPendingFiles(): UploadedFile[] { return this.pendingFiles.filter(f => this.matchesQuery(f)); }
    get filteredUploadingFiles(): UploadedFile[] { return this.uploadingFiles.filter(f => this.matchesQuery(f)); }
    get filteredUploadedFiles(): UploadedFile[] { return this.uploadedFiles.filter(f => this.matchesQuery(f)); }
    get latestUploadedFile(): UploadedFile | null {
        const ups = this.uploadedFiles;
        if (ups.length === 0) return null;
        return ups.reduce((a, b) => {
            const aTime = a.uploadedAt ? a.uploadedAt.getTime() : 0;
            const bTime = b.uploadedAt ? b.uploadedAt.getTime() : 0;
            return bTime > aTime ? b : a;
        });
    }
    get filteredErrorFiles(): UploadedFile[] { return this.errorFiles.filter(f => this.matchesQuery(f)); }

    // File validation
    validateFile(file: File): string | null {
        if (file.size > this.MAX_TOTAL_UPLOAD_SIZE) {
            return 'File size must not exceed the 25MB total upload limit.';
        }
        const extensionIndex = file.name.lastIndexOf('.');
        const fileExtension = extensionIndex >= 0 ? file.name.slice(extensionIndex).toLowerCase() : '';
        const isAllowedType = this.ALLOWED_MIME_TYPES.includes(file.type) || this.ALLOWED_EXTENSIONS.includes(fileExtension);
        if (!isAllowedType) {
            return 'Unsupported file type. Please upload Excel files (.xlsx, .xls) only.';
        }
        return null;
    }
    // Add files to queue
    addFiles(fileList: FileList | File[]): void {
        if (!this.selectedWeekKey) {
            this.toastService.info('Select Week', 'Please select a effective period before adding a file');
            return;
        }
        const list = Array.from(fileList).slice(0, 1);
        const selectedWeek = this.selectedWeekKey;
        const existingPending = this.files.find(
            (f) => f.weekKey === selectedWeek && f.status === 'pending'
        );

        list.forEach((file) => {
            const error = this.validateFile(file);
            if (error) {
                this.toastService.error('Upload Error', `${file.name}: ${error}`);
                return;
            }
            // Duplicate filename check within the selected week (pending list)
            if (existingPending && existingPending.name.trim().toLowerCase() === file.name.trim().toLowerCase()) {
                this.toastService.error('Duplicate File', `A file named "${file.name}" is already pending for this week`);
                return;
            }

            // Override previous pending file for the same week
            if (existingPending) {
                this.files = this.files.filter(
                    (f) => !(f.weekKey === selectedWeek && f.status === 'pending')
                );
            }

            let totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
            const prospectiveTotal = totalSize + file.size;
            if (prospectiveTotal > this.MAX_TOTAL_UPLOAD_SIZE) {
                const exceededBy = this.formatFileSize(prospectiveTotal - this.MAX_TOTAL_UPLOAD_SIZE);
                this.toastService.error('Upload Limit Exceeded', `${file.name}: Adding this file would exceed the 25MB total upload limit by ${exceededBy}.`);
                return;
            }

            const newItem: UploadedFile = {
                id: generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending',
                file,
                progress: 0,
                weekKey: selectedWeek!,
            };
            this.files = [...this.files, newItem];
            // Immediately upload the file
            this.isUploading = true;
            this.uploadFile(newItem)
                .then(() => {
                    this.toastService.success('Upload Complete', `${file.name} uploaded successfully`);
                })
                .catch(() => {
                    this.toastService.error('Upload Error', `${file.name} failed to upload`);
                })
                .finally(() => {
                    this.isUploading = false;
                });
        });
    }
    // Drag and drop handlers
    handleDragEnter(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.dragActive = true;
    }
    handleDragOver(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.dragActive = true;
    }
    handleDragLeave(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.dragActive = false;
    }
    handleDrop(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.dragActive = false;
        if (e.dataTransfer?.files) {
            this.addFiles(e.dataTransfer.files);
        }
    }
    openFilePicker(): void {
        if (!this.selectedWeekKey) {
            this.toastService.info('Select Effective Period', 'Please select effective period before choosing a file');
            return;
        }
        this.fileInputRef.nativeElement.click();
    }
    // File input handler
    handleFileInput(e: Event): void {
        const target = e.target as HTMLInputElement;
        if (target.files) {
            this.addFiles(target.files);
            target.value = ''; // Reset input
        }
    }
    // Simulate file upload with progress
    async uploadFile(fileData: UploadedFile): Promise<void> {
        return new Promise((resolve, reject) => {
            // Update status to uploading
            this.updateFileStatus(fileData.id, { status: 'uploading', progress: 0 });
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5; // Random progress increment
                if (progress >= 100) {
                    clearInterval(interval);
                    // Simulate occasional upload failures (10% chance)
                    if (Math.random() < 0.1) {
                        this.updateFileStatus(fileData.id, {
                            status: 'error',
                            error: 'Upload failed. Please try again.',
                        });
                        reject(new Error('Upload failed'));
                    }
                    else {
                        this.updateFileStatus(fileData.id, {
                            status: 'uploaded',
                            progress: 100,
                            uploadedAt: new Date(),
                        });
                        // Push to Upload History
                        const userName = this.auth.currentUser?.displayName || 'Unknown User';
                        if (fileData.file) {
                            this.history.addFromFile(fileData.file, userName, fileData.weekKey, 'Processed');
                        }
                        resolve();
                    }
                }
                else {
                    this.updateFileStatus(fileData.id, { progress: Math.min(progress, 99) });
                }
            }, 200 + Math.random() * 300); // Random interval for realistic feel
        });
    }
    // Update file status
    updateFileStatus(fileId: string, updates: Partial<UploadedFile>): void {
        this.files = this.files.map((f) => (f.id === fileId ? { ...f, ...updates } : f));
    }
    // Upload all pending files
    async handleUploadAll(): Promise<void> {
        const pendingFiles = this.files.filter((f) => f.status === 'pending');
        if (pendingFiles.length === 0) {
            this.toastService.info('No Files to Upload', 'Please add files to the upload queue first');
            return;
        }
        this.isUploading = true;
        try {
            // Upload files one by one (could be made parallel)
            for (const file of pendingFiles) {
                await this.uploadFile(file);
            }
            this.toastService.success('Upload Complete', `Successfully uploaded ${pendingFiles.length} file(s)`);
        }
        catch (error) {
            this.toastService.error('Upload Error', 'Some files failed to upload');
        }
        finally {
            this.isUploading = false;
        }
    }
    // Remove file from queue
    removeFile(fileId: string): void {
        this.files = this.files.filter((f) => f.id !== fileId);
        this.toastService.info('File Removed', 'File removed from upload queue');
    }
    // Clear all files
    clearAllFiles(): void {
        this.files = [];
        // this.toastService.info('Queue Cleared', 'All files removed from upload queue');
    }

    onWeekChange(weekKey: string): void {
        this.selectedWeekKey = weekKey;
    }

    onPeriodTypeChange(type: 'Weekly' | 'Monthly'): void {
        this.periodType = type;
        this.selectedWeekKey = null;
    }

    getPeriodOptions(): WeekOption[] {
        return this.periodType === 'Monthly' ? this.monthOptions : this.weekOptions;
    }

    getWeekLabel(weekKey: string | null): string {
        if (!weekKey) return '';
        const opt = this.weekOptions.find(w => w.key === weekKey);
        return opt ? opt.label : weekKey;
    }

    getPeriodLabel(key: string | null): string {
        if (!key) return '';
        const all = [...this.weekOptions, ...this.monthOptions];
        const opt = all.find(w => w.key === key);
        return opt ? opt.label : key;
    }

    private generateLatestWeeks(count: number): WeekOption[] {
        const options: WeekOption[] = [];
        const today = new Date();
        let start = this.startOfWeek(today);
        for (let i = 0; i < count; i++) {
            const end = this.endOfWeek(start);
            const startIso = this.toIsoDate(start);
            const endIso = this.toIsoDate(end);
            options.push({
                key: `${startIso}_${endIso}`,
                start: startIso,
                end: endIso,
                label: this.formatWeekLabel(startIso, endIso),
            });
            const prev = new Date(start);
            prev.setUTCDate(prev.getUTCDate() - 7);
            start = prev;
        }
        return options;
    }

    private generateLatestMonths(count: number): WeekOption[] {
        const options: WeekOption[] = [];
        const today = new Date();
        const firstOfThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        let current = new Date(firstOfThisMonth);
        for (let i = 0; i < count; i++) {
            const startIso = this.toIsoDate(current);
            const endDate = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0));
            const endIso = this.toIsoDate(endDate);
            options.push({
                key: `${startIso}_${endIso}`,
                start: startIso,
                end: endIso,
                label: this.formatMonthLabel(startIso, endIso),
            });
            current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1));
        }
        return options;
    }

    private startOfWeek(date: Date): Date {
        const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const day = start.getUTCDay();
        const diff = (day + 6) % 7;
        start.setUTCDate(start.getUTCDate() - diff);
        return start;
    }
    private endOfWeek(start: Date): Date {
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6);
        return end;
    }
    private toIsoDate(date: Date): string {
        return date.toISOString().slice(0, 10);
    }
    private formatWeekLabel(startIso: string, endIso: string): string {
        const s = new Date(`${startIso}T00:00:00Z`);
        const e = new Date(`${endIso}T00:00:00Z`);
        const startLabel = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endLabel = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startLabel} – ${endLabel}`;
    }

    private formatMonthLabel(startIso: string, _endIso: string): string {
        const s = new Date(`${startIso}T00:00:00Z`);
        return s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Retry failed upload
    async retryUpload(fileId: string): Promise<void> {
        const file = this.files.find((f) => f.id === fileId);
        if (file) {
            await this.uploadFile(file);
        }
    }
    // Format file size
    formatFileSize(bytes: number): string {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    // Get file icon based on type
    getFileIcon(type: string): string {
        if (type.includes('pdf'))
            return '📄';
        if (type.includes('excel') || type.includes('spreadsheet'))
            return '📊';
        if (type.includes('word') || type.includes('document'))
            return '📝';
        if (type.includes('csv'))
            return '📋';
        return '📁';
    }
    // Get time ago
    getTimeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1)
            return 'just now';
        if (diffMins < 60)
            return `${diffMins} minutes ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }
}
