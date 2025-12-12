import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private base = `${environment.apiBase}/api`;
  private readonly API = this.base;

  constructor(private http: HttpClient) {}

getEthnicityDistribution(): Observable<EthnicityDistribution> {
  return this.http.get<EthnicityDistribution>(`${this.API}/ethnicity-distribution`);
}

getGenderDistribution(): Observable<GenderDistribution> {
  return this.getEthnicityDistribution().pipe(
    map(dist => ({
      Femme: dist.Femme.reduce((sum, v) => sum + v, 0),
      Homme: dist.Homme.reduce((sum, v) => sum + v, 0),
    }))
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

}
