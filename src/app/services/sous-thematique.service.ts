import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SousThematique } from '../models/sous-thematique.model';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class SousThematiqueService {
  private baseUrl = `${environment.apiBase}/api`;

  constructor(private http: HttpClient, private i18n: TranslationService) {}

  getByThematique(thematiqueId: number): Observable<SousThematique[]> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques`;
    const params = new HttpParams().set('lang', this.i18n.currentLang);
    return this.http.get<any[]>(url, { params }).pipe(
      map(list => list.map(item => this.adapt(item))),
      catchError(() => of([]))
    );
  }

  getById(thematiqueId: number, id: number): Observable<SousThematique | undefined> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques/${id}`;
    const params = new HttpParams().set('lang', this.i18n.currentLang);
    return this.http.get<any>(url, { params }).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }

  create(thematiqueId: number, titre: string, titreEn?: string | null): Observable<SousThematique> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques`;
    return this.http.post<any>(url, { titre, titre_en: titreEn ?? null }).pipe(
      map(item => this.adapt(item))
    );
  }

  update(thematiqueId: number, st: SousThematique): Observable<SousThematique> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques/${st.id}`;
    return this.http.put<any>(url, { titre: st.titre, titre_en: st.titreEn ?? null }).pipe(
      map(item => this.adapt(item))
    );
  }

  delete(thematiqueId: number, id: number): Observable<boolean> {
    const url = `${this.baseUrl}/thematiques/${thematiqueId}/sousthematiques/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private adapt(item: any): SousThematique {
    return new SousThematique(
      item.id,
      item.titre,
      item.thematique_id,
      item.titre_fr ?? item.titre,
      item.titre_en ?? item.titre_en
    );
  }
}
