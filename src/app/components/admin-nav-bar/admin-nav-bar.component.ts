import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Lang, TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-admin-nav-bar',
  templateUrl: './admin-nav-bar.component.html',
  styleUrls: ['./admin-nav-bar.component.css']
})
export class AdminNavBarComponent implements OnInit {

 constructor(
    private notificationService: NotificationService,
    private authservice:AuthService,
    public i18n: TranslationService
  ) { }

  ngOnInit(): void { }

   logout():void {
    this.authservice.logout();
  }

  changeLanguage(lang: Lang): void {
    this.i18n.setLanguage(lang);
  }

  isActiveLang(lang: Lang): boolean {
    return this.i18n.currentLang === lang;
  }
}
