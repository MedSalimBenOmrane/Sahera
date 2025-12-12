import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { combineLatest, map, Observable, take } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return combineLatest([this.auth.isLoggedIn$, this.auth.isAdmin$]).pipe(
      take(1),
      map(([isLoggedIn, isAdmin]) => {
        // Admin OK
        if (isLoggedIn && isAdmin) return true;

        // Connecté mais pas admin -> UrlTree vers /questionnaire
        if (isLoggedIn && !isAdmin) {
          return this.router.createUrlTree(['/questionnaire']);
        }

        // Pas connecté -> UrlTree vers /login avec returnUrl
        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }
}
