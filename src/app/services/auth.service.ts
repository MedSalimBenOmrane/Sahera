// src/app/services/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';

export interface LoginResponse {
  token:  string;
  id:     number;
  nom:    string;
  prenom: string;
  email:  string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:5000/api';

  private userLoginUrl  = `${this.base}/auth/login`;
  private adminLoginUrl = `${this.base}/auth/admin/login`;

  private _isAdmin$    = new BehaviorSubject<boolean>(false);
  isAdmin$            = this._isAdmin$.asObservable();

  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$         = this._isLoggedIn$.asObservable();

  private _user$       = new BehaviorSubject<LoginResponse|null>(null);
  user$               = this._user$.asObservable();

  private logoutTimer: any;

  constructor(private http: HttpClient) {
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

    login(email: string, motDePasse: string, isAdmin: boolean): Observable<LoginResponse> {
    const url = isAdmin ? this.adminLoginUrl : this.userLoginUrl;
    return this.http.post<LoginResponse>(url, { email, mot_de_passe: motDePasse }).pipe(
      tap(resp => {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('user', JSON.stringify(resp));
        localStorage.setItem('loginTime', Date.now().toString());
        localStorage.setItem('isAdmin', JSON.stringify(isAdmin));

        this._isLoggedIn$.next(true);
        this._user$.next(resp);
        this._isAdmin$.next(isAdmin);

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
}
