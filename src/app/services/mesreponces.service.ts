import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslationService } from './translation.service';

export interface ThematiqueLite {
  id: number;
  name: string;
}

type Paginated<T> = { items: T[]; meta: any };

@Injectable({
  providedIn: 'root'
})
export class MesreponcesService {
  private base = `${environment.apiBase}/api`;
  constructor(private http: HttpClient, private i18n: TranslationService) {}

  private params(): HttpParams {
    return new HttpParams().set('lang', this.i18n.currentLang).set('per_page', '1000');
  }

  getCompletedThematiqueIds(clientId: number): Observable<ThematiqueLite[]> {
    return this.http
      .get<Paginated<ThematiqueLite>>(`${this.base}/thematiques/completes/${clientId}`, { params: this.params() })
      .pipe(map(res => res.items ?? []));
  }

  getIncompleteThematiqueIds(clientId: number): Observable<ThematiqueLite[]> {
    return this.http
      .get<Paginated<ThematiqueLite>>(`${this.base}/thematiques/non-completes/${clientId}`, { params: this.params() })
      .pipe(map(res => res.items ?? []));
  }
}
