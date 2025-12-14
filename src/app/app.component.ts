import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sahera';

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        // La page revient depuis le cache "back-forward" → on recharge pour réévaluer les guards
        window.location.reload();
      }
    });

    this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe(() => {
        this.resetScroll();
      });
  }

  private resetScroll(): void {
    // Scroll principal
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Scroll des conteneurs à overflow (tables, blocs admin, etc.)
    const selectors = ['.table__body', 'main.table', '.glass-container'];
    selectors.forEach(sel => {
      document.querySelectorAll<HTMLElement>(sel).forEach(el => (el.scrollTop = 0));
    });
  }
}
