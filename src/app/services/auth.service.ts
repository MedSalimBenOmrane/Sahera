import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAdmin$ = new BehaviorSubject<boolean>(false);
  isAdmin$ = this._isAdmin$.asObservable();

  setAdmin(value: boolean) {
    this._isAdmin$.next(value);
  }
  get isAdmin(): boolean {
    return this._isAdmin$.getValue();
  }
}
