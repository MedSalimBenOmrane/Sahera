import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Thematique } from '../models/thematique.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ThematiqueService {
  private apiUrl = 'http://localhost:5000/api/thematiques';

  constructor(private http: HttpClient) {}

  private toThematique(dto: any): Thematique {
    const ouverture = dto.date_ouverture ? new Date(dto.date_ouverture) : null;
    const cloture   = dto.date_cloture   ? new Date(dto.date_cloture)   : null;

    return new Thematique(
      dto.id,
      dto.name ?? dto.titre ?? '',
      ouverture,
      cloture,
      dto.description ?? ''
    );
  }

  /** GET all thematiques */
  getAll(): Observable<Thematique[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(dto => this.toThematique(dto)))
    );
  }

  /** GET by ID */
  getById(id: number): Observable<Thematique> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  create(t: Partial<Thematique>): Observable<Thematique> {
  const payload: any = {
    name:         t.titre,
    description:  t.description,
    // si t.dateOuvertureSession est un Date -> slice(0,10)
    date_ouverture: t.dateOuvertureSession
      ? (t.dateOuvertureSession instanceof Date
          ? t.dateOuvertureSession.toISOString().slice(0,10)
          : t.dateOuvertureSession)  // si déjà 'YYYY-MM-DD'
      : null,
    date_cloture: t.dateFermetureSession
      ? (t.dateFermetureSession instanceof Date
          ? t.dateFermetureSession.toISOString().slice(0,10)
          : t.dateFermetureSession)
      : null
  };
  return this.http.post<any>(this.apiUrl, payload).pipe(
    map(dto => this.toThematique(dto))
  );
}

update(t: Thematique): Observable<Thematique> {
  const payload = {
    name:         t.titre,
    description:  t.description,
    date_ouverture: t.dateOuvertureSession
      ? (t.dateOuvertureSession instanceof Date
          ? t.dateOuvertureSession.toISOString().slice(0,10)
          : t.dateOuvertureSession)
      : null,
    date_cloture: t.dateFermetureSession
      ? (t.dateFermetureSession instanceof Date
          ? t.dateFermetureSession.toISOString().slice(0,10)
          : t.dateFermetureSession)
      : null
  };
  return this.http.put<any>(`${this.apiUrl}/${t.id}`, payload).pipe(
    map(dto => this.toThematique(dto))
  );
}

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Import CSV */
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
