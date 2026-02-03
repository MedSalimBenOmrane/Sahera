import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Question, QuestionType } from '../models/question.model';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private base = `${environment.apiBase}/api`;
  private apiUrl = `${this.base}/questions`;

  constructor(private http: HttpClient, private i18n: TranslationService) {}

  private langParams(): HttpParams {
    return new HttpParams().set('lang', this.i18n.currentLang);
  }

  getAll(): Observable<Question[]> {
    return this.http.get<any[]>(this.apiUrl, { params: this.langParams() }).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  getById(id: number): Observable<Question | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params: this.langParams() }).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }

  getByIdWithOptions(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params: this.langParams() }).pipe(
      map(item => ({
        id: item.id,
        question: item.texte,
        sousThematiqueId: item.sous_thematique_id ?? item.sousThematiqueId,
        options: item.options || []
      }))
    );
  }

  getBySousThematique(sousThId: number): Observable<Question[]> {
    const url = `${this.base}/sousthematiques/${sousThId}/questions`;
    return this.http.get<any[]>(url, { params: this.langParams() }).pipe(
      map(list => list.map(item => this.adaptFromSous(item, sousThId)))
    );
  }

  /** Version sans filtre de langue (utile pour les stats/admin) */
  getBySousThematiqueRaw(sousThId: number): Observable<Question[]> {
    const url = `${this.base}/sousthematiques/${sousThId}/questions`;
    return this.http.get<any[]>(url).pipe(
      map(list => list.map(item => this.adaptFromSous(item, sousThId)))
    );
  }

  create(q: Question): Observable<Question> {
    const payload: any = {
      texte: q.question,
      texte_en: q.questionEn ?? null,
      sous_thematique_id: q.sousThematiqueId,
      type: q.type,
      options: q.options,
      options_en: q.optionsEn ?? null
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(item => this.adapt(item))
    );
  }

  update(q: Question): Observable<Question> {
    const payload: any = {
      texte: q.question,
      texte_en: q.questionEn ?? null,
      sous_thematique_id: q.sousThematiqueId,
      type: q.type,
      options: q.options,
      options_en: q.optionsEn ?? null
    };
    return this.http.put<any>(`${this.apiUrl}/${q.id}`, payload).pipe(
      map(item => this.adapt(item))
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private adapt(item: any): Question {
    return new Question(
      item.id,
      item.texte ?? item.question,
      item.sous_thematique_id ?? item.sousThematiqueId,
      Array.isArray(item.options) ? item.options : [],
      (item.type ?? item.type_champ ?? 'liste') as QuestionType,
      item.texte_fr ?? item.texte ?? item.question,
      item.texte_en ?? item.question_en,
      item.options_fr ?? item.options,
      item.options_en ?? item.options_en
    );
  }

  private adaptFromSous(item: any, sousThId: number): Question {
    return new Question(
      item.id,
      item.texte ?? item.question,
      sousThId,
      Array.isArray(item.options) ? item.options : [],
      (item.type ?? item.type_champ ?? 'liste') as QuestionType,
      item.texte_fr ?? item.texte ?? item.question,
      item.texte_en ?? item.question_en,
      item.options_fr ?? item.options,
      item.options_en ?? item.options_en
    );
  }
}
