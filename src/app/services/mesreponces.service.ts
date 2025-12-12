import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface ThematiqueLite {
  id: number;
  name: string;
}
export interface ThematiqueLite { id: number; name: string; }
type Paginated<T> = { items: T[]; meta: any };
@Injectable({
  providedIn: 'root'
})

export class MesreponcesService {
  private base = `${environment.apiBase}/api`;
  constructor(private http: HttpClient) {}

  /** IDs + noms des questionnaires complétés */
  getCompletedThematiqueIds(clientId: number): Observable<ThematiqueLite[]> {
    const params = new HttpParams().set('per_page','1000'); // pas de pagination côté UI
    return this.http
      .get<Paginated<ThematiqueLite>>(`${this.base}/thematiques/completes/${clientId}`, { params })
      .pipe(map(res => res.items ?? []));
  }

  getIncompleteThematiqueIds(clientId: number): Observable<ThematiqueLite[]> {
    const params = new HttpParams().set('per_page','1000');
    return this.http
      .get<Paginated<ThematiqueLite>>(`${this.base}/thematiques/non-completes/${clientId}`, { params })
      .pipe(map(res => res.items ?? []));
  }
}