import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Thematique } from '../models/thematique.model';
import { HttpClient } from '@angular/common/http';
import { SousThematique } from '../models/sous-thematique.model';

@Injectable({
  providedIn: 'root'
})
export class ThematiqueService {
  private apiUrl = 'http://localhost:5000/api/thematiques';
  private thematiques: Thematique[] = [
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
  // importe le CSV pour la thematique donnée
  importCsv(thematiqueId: number, formData: FormData): Observable<{
    created_sous_thematiques: number,
    created_questions: number
  }> {
    return this.http.post<{
      created_sous_thematiques: number,
      created_questions: number
    }>(`${this.apiUrl}/${thematiqueId}/import_csv`, formData);
  }
}
