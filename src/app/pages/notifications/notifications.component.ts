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
    this.notifications = this.notificationService.getAllNotifications();
  }

  /**
   * Réception de l’événement depuis NotificationComponent.
   * @param payload contient l’indice dans le tableau ET la nouvelle valeur seen.
   */
  onToggleSeen(payload: { index: number, seen: boolean }): void {
    this.notificationService.setSeen(payload.index, payload.seen);
    // Comme notifications[] est une référence directe,
    // la propriété seen a déjà été mise à jour. Angular rafraîchira le badge.
  }
}
