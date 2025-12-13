import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {

  constructor(private router: Router, public i18n: TranslationService) {}

  connecter(): void {
    this.router.navigate(['/login']);
  }

  setLang(lang: 'fr' | 'en'): void {
    this.i18n.setLanguage(lang);
  }

}
