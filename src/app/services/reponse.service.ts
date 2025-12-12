import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Reponse } from '../models/reponse.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReponseService {
      private baseUrl = `${environment.apiBase}/api`;

  private apiUrl =  `${this.baseUrl}/reponses`;
// 1) Liste en mémoire d'exemples de réponses
  private reponses: Reponse[] = [
    new Reponse(1, 'Oui', new Date('2025-06-01T10:00:00'), 1, 1),
    new Reponse(2, 'Non', new Date('2025-06-02T11:30:00'), 2, 2),
    new Reponse(3, 'Peut-être', new Date('2025-06-03T14:45:00'), 2, 1),
    // … ajoutez d’autres exemples si besoin
  ];

  // 2) Prochain ID auto-incrémenté  
  private nextId = this.reponses.length + 1;

  constructor(private http: HttpClient) {}

  /** Récupère toutes les réponses 
  getAll(): Observable<Reponse[]> {
    return of([...this.reponses]);
  }*/
   getAll(): Observable<Reponse[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(item => this.adapt(item)))
    );
  }

  /** Récupère une réponse par son ID 
  getById(id: number): Observable<Reponse | undefined> {
    const rep = this.reponses.find(r => r.id === id);
    return of(rep);
  }*/
   getById(id: number): Observable<Reponse | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.adapt(item)),
      catchError(() => of(undefined))
    );
  }

  /** Récupère les réponses d’une question donnée 
  getByQuestion(questionId: number): Observable<Reponse[]> {
    const list = this.reponses.filter(r => r.questionId === questionId);
    return of([...list]);
  }*/
  getByQuestion(questionId: number): Observable<Reponse[]> {
    return this.getAll().pipe(
      map(list => list.filter(r => r.questionId === questionId))
    );
  }

  /** Compte le nombre de réponses pour une question 
  getCountByQuestion(questionId: number): Observable<number> {
    const count = this.reponses.filter(r => r.questionId === questionId).length;
    return of(count);
  }*/
  getCountByQuestion(questionId: number): Observable<number> {
    return this.getByQuestion(questionId).pipe(
      map(list => list.length)
    );
  }

  /** Crée une nouvelle réponse 
  create(reponse: Reponse): Observable<Reponse> {
    const newRep = new Reponse(
      this.nextId++,
      reponse.valeur,
      reponse.dateReponse,
      reponse.questionId,
      reponse.userId
    );
    this.reponses.push(newRep);
    return of(newRep);
  }*/
 create(r: Reponse): Observable<Reponse> {
    const payload = {
    contenu: r.valeur,            // <— clé attendue par le back
    question_id: r.questionId,
    utilisateur_id: r.userId,
    date_creation: r.dateReponse.toISOString(),
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => {
        // la route ne renvoie que { id }, on complète avec l'objet local
        return new Reponse(
          res.id,
          r.valeur,
          r.dateReponse,
          r.questionId,
          r.userId
        );
      })
    );
  }

  /** Met à jour une réponse existante 
  update(reponse: Reponse): Observable<Reponse> {
    const idx = this.reponses.findIndex(r => r.id === reponse.id);
    if (idx === -1) {
      return throwError(() => new Error('Réponse introuvable'));
    }
    this.reponses[idx] = reponse;
    return of(reponse);
  }*/
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
  /** Récupère les réponses de l’utilisateur pour une sous-thématique */
  getByClientSousThematique(
    clientId: number,
    sousThematiqueId: number
  ) {
    return this.http.get<{
      reponse_id:   number;
      question_id:  number;
      contenu:      string;
      date_creation:string;
    }[]>(
      `${this.baseUrl}/clients/${clientId}/sousthematiques/${sousThematiqueId}/reponses`
    );
  }

  /** Supprime une réponse 
  delete(id: number): Observable<void> {
    const idx = this.reponses.findIndex(r => r.id === id);
    if (idx === -1) {
      return throwError(() => new Error('Réponse introuvable'));
    }
    this.reponses.splice(idx, 1);
    return of(void 0);
  }*/
   delete(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
  private adapt(item: any): Reponse {
    return new Reponse(
      item.id,
      // back envoie "texte", front utilise "valeur"
      item.texte ?? item.contenu,
      // si le back renvoie date_creation, on la convertit
      item.date_creation ? new Date(item.date_creation) : new Date(),
      item.question_id,
      item.utilisateur_id
    );
  }
}
