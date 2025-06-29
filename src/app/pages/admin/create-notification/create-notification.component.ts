// src/app/pages/admin/create-notification/create-notification.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})
export class CreateNotificationComponent implements OnInit {
  notifications: Notification[] = [];
  newNotif = { titre: '', contenu: '' };

  @ViewChild('dialog', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getAllNotifications()
      .subscribe(list => this.notifications = list);
  }

  openCreateDialog(): void {
    this.newNotif = { titre: '', contenu: '' };
    (this.dialogRef.nativeElement as any).showModal();
  }

  closeDialog(): void {
    (this.dialogRef.nativeElement as any).close();
  }

  sendNotification(): void {
    const userIds = [1, 2, 3];  // toujours admin
    this.notificationService
      .sendNotification(this.newNotif.titre, this.newNotif.contenu, userIds)
      .subscribe(res => {
        const dto = res.notification;
        const notif = new Notification(
          dto.id,
          dto.titre,
          dto.contenu,
          dto.date_envoi,
          false
        );
        this.notificationService.addNotification(notif);
        this.notifications = [...this.notificationService['notifications']];
        this.closeDialog();
      });
  }

  onDeleteNotification(id: number): void {
    this.notificationService.deleteById(id);
    this.notifications = [...this.notificationService['notifications']];
  }


}
