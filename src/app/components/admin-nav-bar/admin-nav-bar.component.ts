import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-admin-nav-bar',
  templateUrl: './admin-nav-bar.component.html',
  styleUrls: ['./admin-nav-bar.component.css']
})
export class AdminNavBarComponent implements OnInit {

 constructor(private notificationService: NotificationService) { }

  ngOnInit(): void { }

  /** Getter qui renvoie le nombre de notifications non lues */
  get unreadCount(): number {
    return this.notificationService.getUnreadCount();
  }
}