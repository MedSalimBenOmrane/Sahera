import { Injectable } from '@angular/core';
import { Question } from '../models/question.model';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
private apiUrl = 'http://localhost:5000/api/questions';
private questions: Question[] = [];

  constructor(private http: HttpClient) { }

  /** GET /questions (en mémoire) 
  getAll(): Observable<Question[]> {
    return of(this.questions.map(q => Object.assign(
      new Question(0, '',  0),
      q
    )));
  }*/
   getAll(): Observable<Question[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  /** GET /questions/:id 
  getById(id: number): Observable<Question | undefined> {
    const found = this.questions.find(q => q.id === id);
    return of(
      found 
        ? Object.assign(new Question(0, '', 0), found) 
        : undefined
    );
  }
*/
  getById(id: number): Observable<Question | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }
  /** GET /questions?sousThematiqueId=XX 
  getBySousThematique(sousThId: number): Observable<Question[]> {
    const filtered = this.questions.filter(q => q.sousThematiqueId === sousThId);
    return of(filtered.map(q => Object.assign(
      new Question(0, '', 0),
      q
    )));
  }*/
   getBySousThematique(sousThId: number): Observable<Question[]> {
    return this.getAll().pipe(
      map(list => list.filter(q => q.sousThematiqueId === sousThId))
    );
  }

  /** CREATE /questions (en mémoire) 
  create(question: Question): Observable<Question> {
    const newId = this.questions.length > 0
      ? Math.max(...this.questions.map(q => q.id)) + 1
      : 1;
    const nouvelle = new Question(
      newId,
      question.question,
 
      question.sousThematiqueId
    );
    this.questions.push(nouvelle);
    return of(nouvelle);
  */
 create(q: Question): Observable<Question> {
    const payload = {
      texte: q.question,
      sous_thematique_id: q.sousThematiqueId
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(item => this.adapt(item))
    );
  }

  /** UPDATE /questions/:id (en mémoire) 
  update(question: Question): Observable<Question | undefined> {
    const index = this.questions.findIndex(q => q.id === question.id);
    if (index === -1) {
      return of(undefined);
    }
    this.questions[index] = Object.assign(new Question(0, '', 0), question);
    return of(this.questions[index]);
  }*/
 update(q: Question): Observable<Question> {
    const payload = {
      texte: q.question,
      sous_thematique_id: q.sousThematiqueId
    };
    return this.http.put<any>(`${this.apiUrl}/${q.id}`, payload).pipe(
      map(item => this.adapt(item))
    );
  }

  /** DELETE /questions/:id (en mémoire) 
  delete(id: number): Observable<boolean> {
    const index = this.questions.findIndex(q => q.id === id);
    if (index === -1) {
      return of(false);
    }
    this.questions.splice(index, 1);
    return of(true);
  }*/
   delete(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
  private adapt(item: any): Question {
    return new Question(
      item.id,
      item.texte,
      // certains back renvoient "sous_thematique_id"
      item.sous_thematique_id ?? item.sousThematiqueId
    );
  }
}
