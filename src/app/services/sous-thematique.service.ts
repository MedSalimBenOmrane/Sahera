import { Injectable } from '@angular/core';
import { SousThematique } from '../models/sous-thematique.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SousThematiqueService {
  private sousThematiques: SousThematique[] = [
 
  new SousThematique( 1,'Qualité du service',1 ),
  new SousThematique( 2,'Délai de réponse',1 ),
  new SousThematique( 3,'Accessibilité du site',1 ),
  new SousThematique( 4,'Clarté des informations',1 ),
  new SousThematique( 5,'Amabilité du personnel',1 ),
  new SousThematique( 6,'Satisfaction globale',1 ),
  new SousThematique( 7, 'SousTh 2-1', 2),
  new SousThematique( 8, 'SousTh 2-2', 2),
  new SousThematique( 9, 'SousTh 2-3', 2),
  new SousThematique(10, 'SousTh 2-4', 2),
  new SousThematique(11, 'SousTh 2-5', 2),
  new SousThematique(12, 'SousTh 2-6', 2),
  new SousThematique(13, 'SousTh 3-1', 3),
  new SousThematique(14, 'SousTh 3-2', 3),
  new SousThematique(15, 'SousTh 3-3', 3),
  new SousThematique(16, 'SousTh 3-4', 3),
  new SousThematique(17, 'SousTh 3-5', 3),
  new SousThematique(18, 'SousTh 3-6', 3)
];

  constructor() { }
/**
   * GET / sous-thématiques (en mémoire)
   */
  getAll(): Observable<SousThematique[]> {
    return of(this.sousThematiques.map(st => Object.assign(
      new SousThematique(0, '', 0),
      st
    )));
  }

  /**
   * GET /sous-thématiques/:id
   */
  getById(id: number): Observable<SousThematique | undefined> {
    const found = this.sousThematiques.find(st => st.id === id);
    return of(
      found
        ? Object.assign(new SousThematique(0, '', 0), found)
        : undefined
    );
  }

  /**
   * GET /sous-thématiques?thematiqueId=XX
   * Filtre toutes les ST dont thematiqueId === argument.
   */
  getByThematique(thematiqueId: number): Observable<SousThematique[]> {
    const filtered = this.sousThematiques.filter(st => st.thematiqueId === thematiqueId);
    return of(filtered.map(st => Object.assign(
      new SousThematique(0, '', 0),
      st
    )));
  }

  /**
   * CREATE (en mémoire)
   */
  create(sousThematique: SousThematique): Observable<SousThematique> {
    const newId = this.sousThematiques.length > 0
      ? Math.max(...this.sousThematiques.map(st => st.id)) + 1
      : 1;
    const nouvelle = new SousThematique(newId, sousThematique.titre, sousThematique.thematiqueId);
    this.sousThematiques.push(nouvelle);
    return of(nouvelle);
  }

  /**
   * UPDATE (en mémoire)
   */
  update(sousThematique: SousThematique): Observable<SousThematique | undefined> {
    const index = this.sousThematiques.findIndex(st => st.id === sousThematique.id);
    if (index === -1) {
      return of(undefined);
    }
    this.sousThematiques[index] = Object.assign(new SousThematique(0, '', 0), sousThematique);
    return of(this.sousThematiques[index]);
  }

  /**
   * DELETE (en mémoire)
   */
  delete(id: number): Observable<boolean> {
    const index = this.sousThematiques.findIndex(st => st.id === id);
    if (index === -1) {
      return of(false);
    }
    this.sousThematiques.splice(index, 1);
    return of(true);
  }
}
