import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Admin } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiBase}/api/admins`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.base}/${id}`);
  }

  update(id: number, payload: Partial<Admin>): Observable<Admin> {
    return this.http.put<Admin>(`${this.base}/${id}`, payload);
  }
}
