import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  showNavbar = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events
      .pipe(
        // Type guard pour que la valeur soit typée en NavigationEnd
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(event => {
        // Ici event est bien un NavigationEnd
        this.showNavbar = event.urlAfterRedirects !== '/';
      });
  }

}
