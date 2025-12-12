import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from 'src/environments/environment';

type Meta = {
  total: number; page: number; per_page: number; pages: number;
  has_next: boolean; has_prev: boolean; next: string|null; prev: string|null;
};
type Paginated<T> = { items: T[]; meta: Meta };

@Injectable({ providedIn: 'root' })
export class ClientsService {
    private base = `${environment.apiBase}/api`;

  private apiUrl =  `${this.base}/utilisateurs`;

  constructor(private http: HttpClient) {}

  private buildParams(obj: Record<string, any>): HttpParams {
    let p = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return p;
  }

  /** ✅ Page paginée de participants */
  getPage(opts: { page?: number; per_page?: number; sort?: string; q?: string } = {})
  : Observable<Paginated<Client>> {
    // par défaut 4 (ton MAX_PER_PAGE côté Flask)
    const params = this.buildParams({ page: 1, per_page: 4, sort: 'nom,prenom', ...opts });

    return this.http.get<Paginated<any>>(this.apiUrl, { params }).pipe(
      map(res => ({
        items: (res.items ?? []).map((u: any) => new Client(
          u.id, u.nom, u.prenom, u.email, /* mot_de_passe */ '',
          u.telephone ?? '',
          u.date_naissance ? new Date(u.date_naissance) : null as any,
          u.genre ?? '', u.role ?? '', u.ethnicite ?? ''
        )),
        meta: res.meta
      }))
    );
  }

  /** CRUD (inchangé) */
  getClientById(id: number): Observable<Client> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(u => new Client(
        u.id, u.nom, u.prenom, u.email, '', u.telephone ?? '',
        u.date_naissance ? new Date(u.date_naissance) : null as any,
        u.genre ?? '', u.role ?? '', u.ethnicite ?? ''
      ))
    );
  }
  getById(id: number) {
  return this.http.get<any>(`${environment.apiBase}/api/utilisateurs/${id}`);
}
  createClient(client: Client): Observable<Client> { return this.http.post<Client>(this.apiUrl, client); }
  updateClient(client: Client): Observable<Client> { return this.http.put<Client>(`${this.apiUrl}/${client.id}`, client); }
  deleteClient(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
