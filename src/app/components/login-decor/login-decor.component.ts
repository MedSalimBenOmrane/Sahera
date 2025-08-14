import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-decor',
  templateUrl: './login-decor.component.html',
  styleUrls: ['./login-decor.component.scss'],
  // standalone: true, // ← décommente si tu utilises des standalone components
})
export class LoginDecorComponent {
  @Input() src: string = 'assets/images/left.png';
  @Input() alt: string = 'Décor';
  @Input() side: 'left' | 'right' = 'left'; // pour gérer marge gauche/droite si besoin
}
