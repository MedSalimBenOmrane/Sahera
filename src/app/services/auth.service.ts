// src/app/services/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface LoginResponse {
  token:  string;
  id:     number;
  nom:    string;
  prenom: string;
  email:  string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiBase}/api`;

  private userLoginUrl  = `${this.base}/auth/login`;
  private adminLoginUrl = `${this.base}/auth/admin/login`;

private _isAdmin$    = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('isAdmin') ?? 'false'));
isAdmin$             = this._isAdmin$.asObservable();

private _isLoggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
isLoggedIn$          = this._isLoggedIn$.asObservable();

  private _user$       = new BehaviorSubject<LoginResponse|null>(null);
  user$               = this._user$.asObservable();

  private logoutTimer: any;

  constructor(private http: HttpClient , private router:Router) {
    this.restoreSession();
  }

  /**
   * email, motDePasse, isAdmin→ si true, on appelle /auth/admin/login
   */

  
  // ===== OTP register =====
  requestCode(payload: any) {
    return this.http.post<{reg_token: string}>(`${this.base}/auth/register/request-code`, payload);
  }
  verifyCode(reg_token: string, code: string) {
    return this.http.post<{message:string, token?:string, user_id?:number}>(`${this.base}/auth/register/verify-code`, { reg_token, code });
  }
  resendCode(reg_token: string) {
    return this.http.post<{reg_token: string, message: string}>(`${this.base}/auth/register/resend-code`, { reg_token });
  }

  //   login(email: string, motDePasse: string, isAdmin: boolean): Observable<LoginResponse> {
  //   const url = isAdmin ? this.adminLoginUrl : this.userLoginUrl;
  //   return this.http.post<LoginResponse>(url, { email, mot_de_passe: motDePasse }).pipe(
  //     tap(resp => {
  //       localStorage.setItem('token', resp.token);
  //       localStorage.setItem('user', JSON.stringify(resp));
  //       localStorage.setItem('loginTime', Date.now().toString());
  //       localStorage.setItem('isAdmin', JSON.stringify(isAdmin));

  //       this._isLoggedIn$.next(true);
  //       this._user$.next(resp);
  //       this._isAdmin$.next(isAdmin);

  //       this.autoLogout(24 * 3600 * 1000);
  //     })
  //   );
  // }
login(email: string, motDePasse: string, isAdminAttempt: boolean): Observable<LoginResponse> {
  const url = isAdminAttempt ? this.adminLoginUrl : this.userLoginUrl;

  return this.http.post<LoginResponse>(url, { email, mot_de_passe: motDePasse }).pipe(
    tap(resp => {
      // 1) Stockage de base
      localStorage.setItem('token', resp.token);
      localStorage.setItem('user', JSON.stringify(resp));
      localStorage.setItem('loginTime', Date.now().toString());

      // 2) Déterminer si c'est vraiment un admin (si le back expose l'info)
      let reallyAdmin = false;
      const anyResp: any = resp as any;

      // a) Champs explicites dans la réponse
      if (typeof anyResp?.role === 'string' && anyResp.role.toLowerCase().includes('admin')) {
        reallyAdmin = true;
      }
      if (anyResp?.is_admin === true || anyResp?.isAdmin === true) {
        reallyAdmin = true;
      }

      // b) Tentative rapide de lecture du JWT si présent (peut ne rien contenir)
      if (!reallyAdmin && resp?.token?.includes('.')) {
        try {
          const b64 = resp.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(b64));

          const bag =
            payload?.roles ??
            payload?.authorities ??
            payload?.scope ??
            payload?.['cognito:groups'] ??
            payload?.role ??
            '';

          const list = Array.isArray(bag) ? bag.map(String) : String(bag).split(/[,\s]+/);
          if (payload?.is_admin === true || payload?.isAdmin === true) {
            reallyAdmin = true;
          } else {
            reallyAdmin = list.some(v => v.toLowerCase().includes('admin'));
          }
        } catch {
          // pas grave si on ne peut pas décoder / rien d'utile
        }
      }

      // 3) Fallback: si on a appelé /auth/admin/login et que rien n'indique le rôle, on force admin
      if (!reallyAdmin && isAdminAttempt) {
        reallyAdmin = true;
      }

      // 4) Propagation d'état
      localStorage.setItem('isAdmin', JSON.stringify(reallyAdmin));
      this._isAdmin$.next(reallyAdmin);
      this._isLoggedIn$.next(true);
      this._user$.next(resp);

      // 5) Auto logout
      this.autoLogout(24 * 3600 * 1000);
    })
  );
}

  /** Vérifie à l’initialisation si on a une session encore valide */
  private restoreSession(): void {
    const token     = localStorage.getItem('token');
    const userRaw   = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime');
    const adminFlag = localStorage.getItem('isAdmin');
    if (!token || !userRaw || !loginTime || adminFlag === null) return;

    const ageMs = Date.now() - parseInt(loginTime, 10);
    if (ageMs < 24 * 3600 * 1000) {
      this._isLoggedIn$.next(true);
      this._user$.next(JSON.parse(userRaw));
      this._isAdmin$.next(JSON.parse(adminFlag));
      this.autoLogout(24 * 3600 * 1000 - ageMs);
    } else {
      this.clearSession();
    }
  }

  logout(): void {
  this.clearSession();
  // navigation centralisée ici
  // attention: si l’interceptor appelle logout() dans un flux d’HTTP, Router peut ne pas être prêt dans certains cas rares
  this.router.navigate(['/login'], { replaceUrl: true });
}

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('isAdmin');
    this._isLoggedIn$.next(false);
    this._user$.next(null);
    this._isAdmin$.next(false);
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private autoLogout(ms: number): void {
    this.logoutTimer = setTimeout(() => this.clearSession(), ms);
  }

  // Getters pour le token et l’utilisateur
  get token(): string | null {
    return localStorage.getItem('token');
  }
  get user(): LoginResponse | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get userId(): number | null {
    return this.user?.id ?? null;
  }
  get isAdmin(): boolean {
    return this._isAdmin$.getValue();
  }
  forgotRequest(email: string) {
  return this.http.post<{reset_token?: string, message: string}>(`${this.base}/auth/password/forgot/request`, { email });
}
forgotResend(reset_token: string) {
  return this.http.post<{reset_token: string, message: string}>(`${this.base}/auth/password/forgot/resend`, { reset_token });
}
forgotVerify(reset_token: string, code: string) {
  return this.http.post<{reset_token: string, message: string}>(`${this.base}/auth/password/forgot/verify`, { reset_token, code });
}
forgotReset(reset_token: string, new_password: string) {
  return this.http.post<{message: string}>(`${this.base}/auth/password/forgot/reset`, { reset_token, new_password });
}
}
