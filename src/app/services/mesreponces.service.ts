import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface ThematiqueLite {
  id: number;
  name: string;
}
@Injectable({
  providedIn: 'root'
})

export class MesreponcesService {
private base = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /** IDs + noms des questionnaires complétés */
  getCompletedThematiqueIds(clientId: number): Observable<ThematiqueLite[]> {
    return this.http.get<ThematiqueLite[]>(
      `${this.base}/thematiques/completes/${clientId}`
    );
  }

  /** IDs + noms des questionnaires incomplétés */
  getIncompleteThematiqueIds(clientId: number): Observable<ThematiqueLite[]> {
    return this.http.get<ThematiqueLite[]>(
      `${this.base}/thematiques/non-completes/${clientId}`
    );
  }
}