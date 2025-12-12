import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Sahera';
  ngOnInit() {
  window.addEventListener('pageshow', (event: PageTransitionEvent) => {
    if (event.persisted) {
      // La page revient depuis le cache "back-forward" → on recharge pour réévaluer les guards
      window.location.reload();
    }
  });
}
}
