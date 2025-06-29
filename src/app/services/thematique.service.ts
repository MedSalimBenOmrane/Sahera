import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Thematique } from '../models/thematique.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ThematiqueService {
  private apiUrl = 'http://localhost:5000/api/thematiques';
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
  
];
  constructor(private http: HttpClient) { }
private toThematique(dto: any): Thematique {
    const dateCreation = dto.date_ouverture
      ? new Date(dto.date_ouverture)
      : new Date();            // fallback : aujourd’hui
    const dateCloture  = dto.date_cloture
      ? new Date(dto.date_cloture)
      : new Date();            // fallback : aujourd’hui

    // dto.description est optionnel côté API GET
    const desc = dto.description ?? '';

    return new Thematique(
      dto.id,
      dto.name,
      dateCreation,
      dateCloture,
      desc
    );
  }
  /** 
   * 
   * GET “all” : renvoie l’ensemble des thématiques existantes 
   
  
  getAll(): Observable<Thematique[]> {
    // on renvoie un clone pour éviter mutation directe depuis l’extérieur
    return of(this.thematiques.map(t => Object.assign(
      new Thematique(0, '', new Date(), new Date(), ''), 
      t
    )));
  }*/


  /**
   * GET by id : renvoie la thématique dont l’id = argument
   */
  /**getById(id: number): Observable<Thematique | undefined> {
    const found = this.thematiques.find(t => t.id === id);
    return of(
      found 
        ? Object.assign(new Thematique(0, '', new Date(), new Date(), ''), found) 
        : undefined
    );
  }**/
  


  /**
   * CREATE : ajoute une nouvelle thématique au tableau.
   * L’objet passé en paramètre doit avoir un id unique (facultatif : on peut le calculer ici).
   
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
  }**/


  /**
   * UPDATE : met à jour la thématique dont l’id correspond.
   * Renvoie la thématique mise à jour (ou undefined si non trouvée).
   
  update(thematique: Thematique): Observable<Thematique | undefined> {
    const index = this.thematiques.findIndex(t => t.id === thematique.id);
    if (index === -1) {
      return of(undefined);
    }
    // Remplacement (clone) de l’ancien objet
    this.thematiques[index] = Object.assign(new Thematique(0, '', new Date(), new Date(), ''), thematique);
    return of(this.thematiques[index]);
  }*/


  /**
   * DELETE : supprime la thématique d’id = argument.
   * Renvoie true si la suppression a eu lieu, false sinon.
   
  delete(id: number): Observable<boolean> {
    const index = this.thematiques.findIndex(t => t.id === id);
    if (index === -1) {
      return of(false);
    }
    this.thematiques.splice(index, 1);
    return of(true);
  }*/
/** GET all thematiques */
  getAll(): Observable<Thematique[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(dto => this.toThematique(dto)))
    );
  }

  /** GET thematique by ID */
  getById(id: number): Observable<Thematique> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  /** POST create thematique */
  create(t: Partial<Thematique>): Observable<Thematique> {
    const payload: any = {
      name:               t.titre,
      description:        t.description,
      date_ouverture:     t.dateCreation?.toISOString(),
      date_cloture:       t.dateFermetureSession?.toISOString()
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  /** PUT update thematique */
  update(t: Thematique): Observable<Thematique> {
    const payload = {
      name:           t.titre,
      description:    t.description,
      date_ouverture: t.dateCreation.toISOString(),
      date_cloture:   t.dateFermetureSession.toISOString()
    };
    return this.http.put<any>(`${this.apiUrl}/${t.id}`, payload).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  /** DELETE thematique */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
