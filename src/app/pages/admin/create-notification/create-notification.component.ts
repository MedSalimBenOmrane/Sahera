import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/models/notification.model';
@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})
export class CreateNotificationComponent implements OnInit {
notifications: Notification[] = [];

  newNotif: Partial<Notification> = {
    objet: '',
    message: ''
  };

  @ViewChild('dialog', { static: true })
  dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notifications = this.notificationService.getAllNotifications();
  }

  openCreateDialog(): void {
    this.newNotif = {};
    (this.dialogRef.nativeElement as any).showModal();
  }

  closeDialog(): void {
    (this.dialogRef.nativeElement as any).close();
  }

  sendNotification(): void {
    const now = new Date();
    const newMessage: Notification = {
      id: this.generateUid(),
      objet: this.newNotif.objet || 'Sans objet',
      message: this.newNotif.message || '',
      date: now,
      seen: false,
      sender: 'admin'
    };

    this.notificationService.addNotification(newMessage);
    this.notifications = this.notificationService.getAllNotifications();
    this.closeDialog();
  }

  generateUid(): number {
    return Math.floor(Math.random() * 1000000);
  }

  onDeleteNotification(id: number): void {
    this.notificationService.deleteById(id);
    this.notifications = this.notificationService.getAllNotifications();
  }

  onToggleSeen(payload: { index: number; seen: boolean }): void {
    this.notificationService.setSeen(payload.index, payload.seen);
  }
}
