import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Thematique } from '../models/thematique.model';
import { TranslationService } from './translation.service';

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
  private apiUrl = `${this.base}/thematiques`;

  constructor(private http: HttpClient, private i18n: TranslationService) {}

  // Avoid timezone shift with YYYY-MM-DD
  private parseISODate(d?: string | null): Date | null {
    return d ? new Date(`${d}T00:00:00`) : null;
  }

  private toThematique(dto: any): Thematique {
    return new Thematique(
      dto.id,
      dto.name ?? dto.titre ?? dto.name_fr ?? '',
      this.parseISODate(dto.date_ouverture),
      this.parseISODate(dto.date_cloture),
      dto.description ?? dto.description_fr ?? '',
      dto.name_fr ?? dto.titre,
      dto.name_en ?? dto.titre_en,
      dto.description_fr ?? dto.description,
      dto.description_en ?? dto.description_en
    );
  }

  private buildParams(obj: Record<string, any>): HttpParams {
    let params = new HttpParams().set('lang', this.i18n.currentLang);
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      params = params.set(k, String(v));
    });
    return params;
  }

  getPage(opts: { page?: number; per_page?: number; sort?: string; q?: string } = {}): Observable<Paginated<Thematique>> {
    const params = this.buildParams({ page: 1, per_page: 4, ...opts });
    return this.http.get<Paginated<any>>(this.apiUrl, { params }).pipe(
      map(res => ({
        items: (res.items ?? []).map((d: any) => this.toThematique(d)),
        meta: res.meta
      }))
    );
  }

  getAll(): Observable<Thematique[]> {
    return this.getPage({ page: 1, per_page: 1000, sort: '-date_ouverture,name' })
      .pipe(map(res => res.items));
  }

  getById(id: number): Observable<Thematique> {
    const params = new HttpParams().set('lang', this.i18n.currentLang);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params }).pipe(
      map(dto => this.toThematique(dto))
    );
  }

  create(t: Partial<Thematique>): Observable<Thematique> {
    const payload: any = {
      name: t.titre,
      name_en: t.titreEn ?? null,
      description: t.description ?? null,
      description_en: t.descriptionEn ?? null,
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

  update(t: Thematique): Observable<Thematique> {
    const payload: any = {
      name: t.titre,
      name_en: t.titreEn ?? null,
      description: t.description ?? null,
      description_en: t.descriptionEn ?? null,
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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

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
