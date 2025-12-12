import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { combineLatest, map, Observable, take } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([this.auth.isLoggedIn$, this.auth.isAdmin$]).pipe(
      take(1),
      map(([isLoggedIn, isAdmin]) => {
        if (!isLoggedIn) return true; // OK pour rester sur /login
        // Rediriger proprement selon le rôle
        const target = isAdmin ? '/admin/dashboard' : '/questionnaire';
        return this.router.createUrlTree([target]);
      })
    );
  }
}
