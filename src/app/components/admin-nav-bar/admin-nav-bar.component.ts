import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-admin-nav-bar',
  templateUrl: './admin-nav-bar.component.html',
  styleUrls: ['./admin-nav-bar.component.css']
})
export class AdminNavBarComponent implements OnInit {

 constructor(private notificationService: NotificationService,private authservice:AuthService) { }

  ngOnInit(): void { }

   logout():void {
    this.authservice.logout();
  }
  
}