import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Reponse } from '../models/reponse.model';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class ReponseService {
  private baseUrl = `${environment.apiBase}/api`;
  private apiUrl = `${this.baseUrl}/reponses`;

  constructor(private http: HttpClient, private i18n: TranslationService) {}

  private langParams(): HttpParams {
    return new HttpParams().set('lang', this.i18n.currentLang);
  }

  getAll(): Observable<Reponse[]> {
    return this.http.get<any[]>(this.apiUrl, { params: this.langParams() }).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  /** Version sans filtre de langue (utile pour les stats/admin) */
  getAllRaw(): Observable<Reponse[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  getById(id: number): Observable<Reponse | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params: this.langParams() }).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }

  getByQuestion(questionId: number): Observable<Reponse[]> {
    const params = this.langParams().set('question_id', String(questionId));
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  getCountByQuestion(questionId: number): Observable<number> {
    return this.getByQuestion(questionId).pipe(map(list => list.length));
  }

  create(r: Reponse): Observable<Reponse> {
    const payload = {
      contenu: r.valeur,
      question_id: r.questionId,
      utilisateur_id: r.userId,
      date_creation: r.dateReponse.toISOString()
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => new Reponse(res.id, r.valeur, r.dateReponse, r.questionId, r.userId))
    );
  }

  update(r: Reponse): Observable<Reponse> {
    const payload = {
      contenu: r.valeur,
      question_id: r.questionId,
      utilisateur_id: r.userId,
      date_creation: r.dateReponse.toISOString()
    };
    return this.http.put<any>(`${this.apiUrl}/${r.id}`, payload).pipe(
      map(res => this.adapt({ id: res.id, ...payload }))
    );
  }

  getByClientSousThematique(clientId: number, sousThematiqueId: number) {
    const params = this.langParams();
    return this.http.get<any[]>(
      `${this.baseUrl}/clients/${clientId}/sousthematiques/${sousThematiqueId}/reponses`,
      { params }
    ).pipe(
      map(list => list.map(r => ({
        reponse_id: r.reponse_id ?? r.id,
        question_id: r.question_id,
        contenu: r.contenu
      })))
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private adapt(item: any): Reponse {
    return new Reponse(
      item.id,
      item.contenu ?? item.texte,
      item.date_creation ? new Date(item.date_creation) : new Date(),
      item.question_id,
      item.utilisateur_id,
      item.contenu_fr ?? item.contenu,
      item.contenu_en ?? item.contenu,
      item.contenu_raw ?? item.contenu
    );
  }
}
