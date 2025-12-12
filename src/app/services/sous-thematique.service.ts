// src/app/services/sous-thematique.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SousThematique } from '../models/sous-thematique.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SousThematiqueService {
  private baseUrl = `${environment.apiBase}/api`;


  constructor(private http: HttpClient) {}

  /** GET /thematiques/:thematiqueId/sousthematiques */
  getByThematique(thematiqueId: number): Observable<SousThematique[]> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques`;
    return this.http.get<any[]>(url).pipe(
      map(list => list.map(item => this.adapt(item))),
      catchError(() => of([]))
    );
  }

  /** GET /thematiques/:thematiqueId/sousthematiques/:id */
  getById(thematiqueId: number, id: number): Observable<SousThematique|undefined> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques/${id}`;
    return this.http.get<any>(url).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }

  /** POST /thematiques/:thematiqueId/sousthematiques */
  create(thematiqueId: number, titre: string): Observable<SousThematique> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques`;
    return this.http.post<any>(url, { titre }).pipe(
      map(item => this.adapt(item))
    );
  }

  /** PUT /thematiques/:thematiqueId/sousthematiques/:id */
  update(thematiqueId: number, st: SousThematique): Observable<SousThematique> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques/${st.id}`;
    return this.http.put<any>(url, { titre: st.titre }).pipe(
      map(item => this.adapt(item))
    );
  }

  /** DELETE /thematiques/:thematiqueId/sousthematiques/:id */
  delete(thematiqueId: number, id: number): Observable<boolean> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Convertit le JSON du back (snake_case) en instance TS (camelCase) */
  private adapt(item: any): SousThematique {
    return new SousThematique(
      item.id,
      item.titre,
      // l’API renvoie "thematique_id"
      item.thematique_id
    );
  }
}
