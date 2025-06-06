import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

 constructor(private notificationService: NotificationService) { }

  ngOnInit(): void { }

  /** Getter qui renvoie le nombre de notifications non lues */
  get unreadCount(): number {
    return this.notificationService.getUnreadCount();
  }
}
