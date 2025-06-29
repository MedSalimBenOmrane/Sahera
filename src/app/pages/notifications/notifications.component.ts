import { Component, OnInit } from '@angular/core';
import { Notification } from 'src/app/models/notification.model';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
  this.notificationService.getAllNotifications()
      .subscribe(list => this.notifications = list);
  }

  /**
   * Réception de l’événement depuis NotificationComponent.
   * @param payload contient l’indice dans le tableau ET la nouvelle valeur seen.
   */
onToggleSeen(payload: { index: number; seen: boolean }): void {
  const notif = this.notifications[payload.index];
  this.notificationService
    .setSeen(notif.id, payload.seen)
    .subscribe({
      next: () => { /* tout est à jour */ },
      error: err => {
        console.error('Impossible de changer le statut', err);
        // on revert local si besoin
        notif.est_lu = !payload.seen;
      }
    });
}
}
