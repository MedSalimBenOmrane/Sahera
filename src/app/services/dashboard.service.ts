import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
export interface EthnicityDistribution {
  labels: string[];
  Homme: number[];
  Femme: number[];
}
export interface GenderDistribution {
  male: number;
  female: number;
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
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getEthnicityDistribution(): Observable<EthnicityDistribution> {
    return this.http.get<EthnicityDistribution>(
      `${this.API}/ethnicity-distribution`
    );
  }
  getGenderDistribution(): Observable<GenderDistribution> {
    return this.getEthnicityDistribution().pipe(
      map(dist => ({
        female: dist.Femme.reduce((sum, v) => sum + v, 0),
        male:   dist.Homme.reduce((sum, v) => sum + v, 0)
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
