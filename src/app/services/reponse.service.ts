import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Reponse } from '../models/reponse.model';

@Injectable({
  providedIn: 'root'
})
export class ReponseService {
// 1) Liste en mémoire d'exemples de réponses
  private reponses: Reponse[] = [
    new Reponse(1, 'Oui', new Date('2025-06-01T10:00:00'), 1, 1),
    new Reponse(2, 'Non', new Date('2025-06-02T11:30:00'), 2, 2),
    new Reponse(3, 'Peut-être', new Date('2025-06-03T14:45:00'), 2, 1),
    // … ajoutez d’autres exemples si besoin
  ];

  // 2) Prochain ID auto-incrémenté  
  private nextId = this.reponses.length + 1;

  constructor() {}

  /** Récupère toutes les réponses */
  getAll(): Observable<Reponse[]> {
    return of([...this.reponses]);
  }

  /** Récupère une réponse par son ID */
  getById(id: number): Observable<Reponse | undefined> {
    const rep = this.reponses.find(r => r.id === id);
    return of(rep);
  }

  /** Récupère les réponses d’une question donnée */
  getByQuestion(questionId: number): Observable<Reponse[]> {
    const list = this.reponses.filter(r => r.questionId === questionId);
    return of([...list]);
  }

  /** Compte le nombre de réponses pour une question */
  getCountByQuestion(questionId: number): Observable<number> {
    const count = this.reponses.filter(r => r.questionId === questionId).length;
    return of(count);
  }

  /** Crée une nouvelle réponse */
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
  }

  /** Met à jour une réponse existante */
  update(reponse: Reponse): Observable<Reponse> {
    const idx = this.reponses.findIndex(r => r.id === reponse.id);
    if (idx === -1) {
      return throwError(() => new Error('Réponse introuvable'));
    }
    this.reponses[idx] = reponse;
    return of(reponse);
  }

  /** Supprime une réponse */
  delete(id: number): Observable<void> {
    const idx = this.reponses.findIndex(r => r.id === id);
    if (idx === -1) {
      return throwError(() => new Error('Réponse introuvable'));
    }
    this.reponses.splice(idx, 1);
    return of(void 0);
  }
}
