import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Thematique } from '../models/thematique.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type Meta = {
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  next: string | null;
  prev: string | null;
};
type Paginated<T> = { items: T[]; meta: Meta };

@Injectable({ providedIn: 'root' })
export class ThematiqueService {
      private base = `${environment.apiBase}/api`;

  private apiUrl =  `${this.base}/thematiques`;

  constructor(private http: HttpClient) {}

  // éviter les surprises de fuseau avec 'YYYY-MM-DD'
  private parseISODate(d?: string | null): Date | null {
    return d ? new Date(`${d}T00:00:00`) : null;
  }

  private toThematique(dto: any): Thematique {
    return new Thematique(
      dto.id,
      dto.name ?? dto.titre ?? '',
      this.parseISODate(dto.date_ouverture),
      this.parseISODate(dto.date_cloture),
      dto.description ?? ''
    );
  }

  private buildParams(obj: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      params = params.set(k, String(v));
    });
    return params;
  }

  /** 🔹 Récupère UNE page paginée (ce que ton composant utilise) */
  getPage(opts: { page?: number; per_page?: number; sort?: string; q?: string } = {})
    : Observable<Paginated<Thematique>> {
    const params = this.buildParams({ page: 1, per_page: 4, ...opts });
    return this.http.get<Paginated<any>>(this.apiUrl, { params }).pipe(
      map(res => ({
        items: (res.items ?? []).map((d: any) => this.toThematique(d)),
        meta: res.meta
      }))
    );
  }

  /** (optionnel) pratique pour récupérer la 1ʳᵉ page complète */
getAll(): Observable<Thematique[]> {
  // per_page large pour tout récupérer
  return this.getPage({ page: 1, per_page: 1000, sort: '-date_ouverture,name' })
    .pipe(map(res => res.items));
}

  /** GET by ID */
  getById(id: number): Observable<Thematique> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  /** CREATE */
  create(t: Partial<Thematique>): Observable<Thematique> {
    const payload: any = {
      name: t.titre,
      description: t.description ?? null,
      date_ouverture: t.dateOuvertureSession
        ? (t.dateOuvertureSession instanceof Date
            ? t.dateOuvertureSession.toISOString().slice(0, 10)
            : t.dateOuvertureSession)
        : null,
      date_cloture: t.dateFermetureSession
        ? (t.dateFermetureSession instanceof Date
            ? t.dateFermetureSession.toISOString().slice(0, 10)
            : t.dateFermetureSession)
        : null
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  /** UPDATE */
  update(t: Thematique): Observable<Thematique> {
    const payload: any = {
      name: t.titre,
      description: t.description ?? null,
      date_ouverture: t.dateOuvertureSession
        ? (t.dateOuvertureSession instanceof Date
            ? t.dateOuvertureSession.toISOString().slice(0, 10)
            : t.dateOuvertureSession)
        : null,
      date_cloture: t.dateFermetureSession
        ? (t.dateFermetureSession instanceof Date
            ? t.dateFermetureSession.toISOString().slice(0, 10)
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

  /** Import CSV (tu passes déjà un FormData depuis le composant) */
  importCsv(
    thematiqueId: number,
    formData: FormData
  ): Observable<{ created_sous_thematiques: number; created_questions: number; }> {
    return this.http.post<{ created_sous_thematiques: number; created_questions: number; }>(
      `${this.apiUrl}/${thematiqueId}/import_csv`,
      formData
    );
  }
}
