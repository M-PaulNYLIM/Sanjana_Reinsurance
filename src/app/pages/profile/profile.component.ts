import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../components/ui/card';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { InputComponent } from '../../components/ui/input/input.component';
import { BadgeComponent } from '../../components/ui/badge/badge.component';
import { AvatarComponent, AvatarFallbackComponent } from '../../components/ui/avatar/avatar.component';
import { TabsComponent, TabsListComponent, TabsTriggerComponent, TabsContentComponent } from '../../components/ui/tabs';
import { SwitchComponent } from '../../components/ui/switch/switch.component';
import { LabelComponent } from '../../components/ui/label/label.component';
import { SeparatorComponent } from '../../components/ui/separator/separator.component';
interface UserProfile {
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    location: string;
    joinDate: string;
    employeeId: string;
    manager: string;
    team: string;
    clearanceLevel: string;
    timezone: string;
}
interface ActivityItem {
    action: string;
    file?: string;
    report?: string;
    treaty?: string;
    metric?: string;
    date: string;
}
interface Permission {
    module: string;
    access: string;
    level: string;
}
interface NotificationSetting {
    label: string;
    key: string;
    enabled: boolean;
    description: string;
}
@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        CardDescriptionComponent,
        ButtonComponent,
        InputComponent,
        BadgeComponent,
        AvatarComponent,
        AvatarFallbackComponent,
        TabsComponent,
        TabsListComponent,
        TabsTriggerComponent,
        TabsContentComponent,
        SwitchComponent,
        LabelComponent,
        SeparatorComponent,
    ],
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
    activeTab = 'overview';
    isEditing = false;
    userProfile: UserProfile = {
        name: 'Lauren M. Cocchiarelli',
        email: 'l.cocchiarelli@newyorklife.com',
        phone: '+1 (555) 123-4567',
        department: 'Reinsurance Analytics',
        position: 'Senior Risk Analyst',
        location: 'New York, NY',
        joinDate: 'March 15, 2019',
        employeeId: 'NYL-2019-0314',
        manager: 'Michael Thompson',
        team: 'Portfolio Risk Management',
        clearanceLevel: 'Level 3 - Confidential',
        timezone: 'Eastern Time (ET)',
    };
    editedProfile: UserProfile = { ...this.userProfile };
    recentActivity: ActivityItem[] = [
        {
            action: 'Uploaded reinsurance data',
            file: 'Q4_2024_Portfolio.xlsx',
            date: '2 hours ago',
        },
        {
            action: 'Generated analytics report',
            report: 'Risk Assessment Dashboard',
            date: '1 day ago',
        },
        {
            action: 'Updated treaty details',
            treaty: 'Everlake Treaty 01',
            date: '3 days ago',
        },
        {
            action: 'Reviewed compliance metrics',
            metric: 'Portfolio Diversification',
            date: '1 week ago',
        },
    ];
    accessPermissions: Permission[] = [
        { module: 'Dashboard Analytics', access: 'Full Access', level: 'Read/Write' },
        { module: 'File Upload', access: 'Full Access', level: 'Read/Write' },
        { module: 'Reinsurance Data', access: 'Full Access', level: 'Read/Write' },
        { module: 'Compliance Reports', access: 'Read Only', level: 'Read' },
        { module: 'Admin Settings', access: 'Restricted', level: 'None' },
    ];
    notifications: NotificationSetting[] = [
        {
            label: 'File Upload Notifications',
            key: 'fileUpload',
            enabled: true,
            description: 'Get notified when files are uploaded or processed',
        },
        {
            label: 'Analytics Updates',
            key: 'analytics',
            enabled: true,
            description: 'Receive updates when new analytics are available',
        },
        {
            label: 'Compliance Alerts',
            key: 'compliance',
            enabled: false,
            description: 'Important compliance and regulatory notifications',
        },
        {
            label: 'System Maintenance',
            key: 'maintenance',
            enabled: true,
            description: 'System updates and maintenance notifications',
        },
        {
            label: 'Email Summaries',
            key: 'emailSummary',
            enabled: false,
            description: 'Weekly email digest of your activity',
        },
    ];
    ngOnInit(): void { }
    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }
    startEditing(): void {
        this.isEditing = true;
        this.editedProfile = { ...this.userProfile };
    }
    handleSave(): void {
        this.userProfile = { ...this.editedProfile };
        this.isEditing = false;
        console.log('Profile updated:', this.userProfile);
    }
    handleCancel(): void {
        this.editedProfile = { ...this.userProfile };
        this.isEditing = false;
    }
    toggleNotification(key: string): void {
        this.notifications = this.notifications.map((item) => item.key === key ? { ...item, enabled: !item.enabled } : item);
    }
    getPermissionVariant(access: string): 'default' | 'secondary' | 'destructive' {
        switch (access) {
            case 'Full Access':
                return 'default';
            case 'Read Only':
                return 'secondary';
            case 'Restricted':
                return 'destructive';
            default:
                return 'secondary';
        }
    }
}
