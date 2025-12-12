import { Injectable } from '@angular/core';
import { Question } from '../models/question.model';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private base = `${environment.apiBase}/api`;

  private apiUrl =  `${this.base}/questions`;

  constructor(private http: HttpClient) {}

  // --- Récupère TOUTES les questions (si tu en as besoin ailleurs)
  getAll(): Observable<Question[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  getById(id: number): Observable<Question | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }
  // question.service.ts
getByIdWithOptions(id: number) {
  return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
    map(item => ({
      id: item.id,
      question: item.texte,
      sousThematiqueId: item.sous_thematique_id ?? item.sousThematiqueId,
      options: item.options || []
    }))
  );
}

  // --- IMPORTANT: utiliser la route backend dédiée qui renvoie déjà {id, texte, options}
  getBySousThematique(sousThId: number): Observable<Question[]> {
    const url = `${this.base}/sousthematiques/${sousThId}/questions`;
    return this.http.get<any[]>(url).pipe(
      map(list => list.map(item => this.adaptFromSous(item, sousThId)))
    );
  }

  create(q: Question): Observable<Question> {
    const payload = {
      texte: q.question,
      sous_thematique_id: q.sousThematiqueId,
      // si tu crées des questions manuellement ici, prévois aussi options si besoin
      // options: q.options
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(item => this.adapt(item))
    );
  }

  update(q: Question): Observable<Question> {
    const payload = {
      texte: q.question,
      sous_thematique_id: q.sousThematiqueId,
      // options: q.options
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

  // --- mapping standard depuis /api/questions (renvoie: id, texte, sous_thematique_id, options)
  private adapt(item: any): Question {
    return new Question(
      item.id,
      item.texte ?? item.question,
      item.sous_thematique_id ?? item.sousThematiqueId,
      Array.isArray(item.options) ? item.options : [],   // options si liste
      (item.type ?? item.type_champ ?? 'liste') as any
    );
  }

  // --- mapping depuis /api/sousthematiques/:id/questions (renvoie: id, texte, options)
  private adaptFromSous(item: any, sousThId: number): Question {
    return new Question(
      item.id,
      item.texte ?? item.question,
      sousThId,
      Array.isArray(item.options) ? item.options : [],
      (item.type ?? item.type_champ ?? 'liste') as any
    );
  }
}
