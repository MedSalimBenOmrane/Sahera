import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Thematique } from '../models/thematique.model';

@Injectable({
  providedIn: 'root'
})
export class ThematiqueService {

  private thematiques: Thematique[] = [
  new Thematique(
    1, 
    'Traitement', 
    new Date('2025-03-20'), 
    new Date('2025-07-20'), 
    'Votre retour sur les procédures internes est précieux…'
  ),
  new Thematique(
    2, 
    'Enquête satisfaction clients', 
    new Date('2025-04-01'), 
    new Date('2025-06-01'), 
    'Nous souhaitons mesurer la satisfaction globale…'
  ),
  new Thematique(
    3, 
    'Évaluation formation', 
    new Date('2025-04-15'), 
    new Date('2025-07-15'), 
    'Merci de répondre aux questions concernant la formation…'
  )
];
  constructor() { }

  /** 
   * GET “all” : renvoie l’ensemble des thématiques existantes 
   */
  getAll(): Observable<Thematique[]> {
    // on renvoie un clone pour éviter mutation directe depuis l’extérieur
    return of(this.thematiques.map(t => Object.assign(
      new Thematique(0, '', new Date(), new Date(), ''), 
      t
    )));
  }

  /**
   * GET by id : renvoie la thématique dont l’id = argument
   */
  getById(id: number): Observable<Thematique | undefined> {
    const found = this.thematiques.find(t => t.id === id);
    return of(
      found 
        ? Object.assign(new Thematique(0, '', new Date(), new Date(), ''), found) 
        : undefined
    );
  }

  /**
   * CREATE : ajoute une nouvelle thématique au tableau.
   * L’objet passé en paramètre doit avoir un id unique (facultatif : on peut le calculer ici).
   */
  create(thematique: Thematique): Observable<Thematique> {
    // Calcul d’un nouvel ID si besoin
    const newId = this.thematiques.length > 0 
      ? Math.max(...this.thematiques.map(t => t.id)) + 1 
      : 1;
    const nouvelle: Thematique = new Thematique(
      newId,
      thematique.titre,
      thematique.dateCreation,
      thematique.dateFermetureSession,
      thematique.description
    );
    this.thematiques.push(nouvelle);
    return of(nouvelle);
  }

  /**
   * UPDATE : met à jour la thématique dont l’id correspond.
   * Renvoie la thématique mise à jour (ou undefined si non trouvée).
   */
  update(thematique: Thematique): Observable<Thematique | undefined> {
    const index = this.thematiques.findIndex(t => t.id === thematique.id);
    if (index === -1) {
      return of(undefined);
    }
    // Remplacement (clone) de l’ancien objet
    this.thematiques[index] = Object.assign(new Thematique(0, '', new Date(), new Date(), ''), thematique);
    return of(this.thematiques[index]);
  }

  /**
   * DELETE : supprime la thématique d’id = argument.
   * Renvoie true si la suppression a eu lieu, false sinon.
   */
  delete(id: number): Observable<boolean> {
    const index = this.thematiques.findIndex(t => t.id === id);
    if (index === -1) {
      return of(false);
    }
    this.thematiques.splice(index, 1);
    return of(true);
  }
}
