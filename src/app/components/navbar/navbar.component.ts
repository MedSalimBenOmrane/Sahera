import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

 constructor(private notificationService: NotificationService) { }

  ngOnInit(): void { // ← on précharge immédiatement la liste des notifs pour l'utilisateur courant
    this.notificationService.getNotificationsForCurrentUser()
      .subscribe({
        next: () => {
          // rien à faire ici, tap() dans le service aura déjà mis à jour this.notifications
        },
        error: err => {
          console.error('Impossible de charger les notifications', err);
        }
      }); }

  /** Getter qui renvoie le nombre de notifications non lues */
  get unreadCount(): number {
    return this.notificationService.getUnreadCount();
  }
}
