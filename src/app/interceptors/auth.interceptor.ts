import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.auth.token;
  const isApi = req.url.startsWith(environment.apiBase); // sécurise la portée

  if (token && isApi) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApi && (error.status === 401 || error.status === 403)) {
        this.auth.logout(); // navigation centralisée
      }
      return throwError(() => error);
    })
  );
} }

