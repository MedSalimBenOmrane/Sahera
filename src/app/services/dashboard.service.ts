import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, expand, map, Observable, reduce } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface EthnicityDistribution {
  labels: string[];
  Homme: number[];  // <-- was Male
  Femme: number[];
}
export interface GenderDistribution {
  Homme: number;    // <-- was Male
  Femme: number;    // <-- was female (casing)
}
export interface ThematiqueProgress {
  id: number;
  name: string;
  completed_count: number;
  incomplete_count: number;
}
export interface AgeDistribution {
  labels: string[];
  counts: number[];
}
type Meta = {
  total?: number; page?: number; per_page?: number; pages?: number;
  has_next?: boolean; has_prev?: boolean; next?: string|null; prev?: string|null;
};
type Paginated<T> = { items: T[]; meta: Meta };

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private base = `${environment.apiBase}/api`;
  private readonly API = this.base;
  private readonly usersUrl = `${this.API}/utilisateurs`;

  constructor(private http: HttpClient) {}

getEthnicityDistribution(): Observable<EthnicityDistribution> {
  return this.http.get<EthnicityDistribution>(`${this.API}/ethnicity-distribution`);
}

getGenderDistribution(): Observable<GenderDistribution> {
  const perPage = 50;
  return this.getUsersPage(1, perPage).pipe(
    expand(res => {
      const page = res?.meta?.page ?? 1;
      const pages = res?.meta?.pages ?? 1;
      const next = page + 1;
      if (next > pages) return EMPTY;
      return this.getUsersPage(next, res?.meta?.per_page ?? perPage);
    }),
    map(res => res.items ?? []),
    reduce((acc, items) => {
      items.forEach((u: any) => {
        const isAdmin =
          String(u?.role ?? '').toLowerCase().includes('admin') ||
          u?.is_admin === true ||
          u?.isAdmin === true;
        if (isAdmin) return;

        const g = String(u?.genre ?? u?.gender ?? '').toLowerCase();
        if (g === 'femme' || g === 'female') acc.Femme += 1;
        else if (g === 'homme' || g === 'male') acc.Homme += 1;
      });
      return acc;
    }, { Femme: 0, Homme: 0 } as GenderDistribution),
    catchError(() => this.getEthnicityDistribution().pipe(
      map(dist => ({
        Femme: this.sumArray(dist?.Femme),
        Homme: this.sumArray(dist?.Homme),
      }))
    ))
  );
}
  getThematiquesProgress(): Observable<ThematiqueProgress[]> {
    return this.http.get<ThematiqueProgress[]>(
      `${this.API}/thematiques/progress`
    );
  }
getAgeDistribution(): Observable<AgeDistribution> {
  return this.http.get<AgeDistribution>(`${this.API}/age-distribution`);
}

private getUsersPage(page: number, perPage: number): Observable<Paginated<any>> {
  const params = new HttpParams()
    .set('page', String(page))
    .set('per_page', String(perPage));
  return this.http.get<Paginated<any>>(this.usersUrl, { params });
}

private sumArray(arr?: Array<number | string>): number {
  return (arr ?? []).reduce<number>((sum, v) => sum + (Number(v) || 0), 0);
}

}
