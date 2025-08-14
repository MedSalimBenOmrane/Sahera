// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NotificationDto, Notification } from '../models/notification.model';

// ---- types pagination (mêmes que dans ton service thématique) ----
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
export class NotificationService {
  private baseUrl = 'http://localhost:5000/api';
  private userId: number | null;
  private notifications: Notification[] = [];

  constructor(private http: HttpClient) {
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
  const usr = raw ? JSON.parse(raw) : null;
  this.userId = usr?.id ?? null;
  }

  getPageAll(opts: {
  page?: number; per_page?: number; sort?: string; q?: string;
  date_from?: string; date_to?: string;
} = {}): Observable<{ items: Notification[]; meta: any }> {
  const params = this.buildParams({ page: 1, per_page: 4, sort: '-date_envoi,id', ...opts });

  return this.http
    .get<{ items: any[]; meta: any }>(`${this.baseUrl}/notifications`, { params }) // 👈 endpoint global
    .pipe(
      map(res => ({
        items: (res.items ?? []).map(dto => new Notification(
          dto.id ?? dto.notification_id, // selon ce que renvoie le back global
          dto.titre,
          dto.contenu,
          dto.date_envoi,
          false /* pas d'est_lu par user ici */
        )),
        meta: res.meta
      }))
    );
}

  // utilitaire pour construire les query params
  private buildParams(obj: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      params = params.set(k, String(v));
    });
    return params;
  }

  // --- envoyer une notification (inchangé) ---
  sendNotification(
    titre: string,
    contenu: string,
    utilisateurIds: number[]
  ): Observable<{ message: string; notification: any }> {
    return this.http.post<{ message: string; notification: any }>(
      `${this.baseUrl}/notifications/send`,
      { titre, contenu, utilisateur_ids: utilisateurIds }
    );
  }

  /**
   * 🔹 Récupère UNE page paginée de notifications pour l’utilisateur courant
   * - par défaut: 1ère page, 4 éléments, tri plus récentes d’abord
   * - filtres possibles: q, est_lu (true/false), date_from, date_to
   */
  getPageForCurrentUser(opts: {
    page?: number;
    per_page?: number;
    sort?: string;
    q?: string;
    est_lu?: boolean | string;
    date_from?: string;  // 'YYYY-MM-DD'
    date_to?: string;    // 'YYYY-MM-DD'
  } = {}): Observable<Paginated<Notification>> {
    if (this.userId === null) {
      // Retourne une page vide cohérente
      return of({
        items: [],
        meta: {
          total: 0, page: 1, per_page: 4, pages: 1,
          has_next: false, has_prev: false, next: null, prev: null
        }
      });
    }

    // ⚠️ par défaut 4 par page
    const params = this.buildParams({
      page: 1,
      per_page: 4,
      sort: '-date_envoi,id',
      ...opts
    });

    return this.http
      .get<Paginated<NotificationDto>>(`${this.baseUrl}/notifications/${this.userId}`, { params })
      .pipe(
        map(res => ({
          items: (res.items ?? []).map(dto => new Notification(
            dto.notification_id,
            dto.titre,
            dto.contenu,
            dto.date_envoi,
            dto.est_lu
          )),
          meta: res.meta
        })),
        // garde la dernière page en mémoire (optionnel)
        tap(p => this.notifications = p.items)
      );
  }

  /** (Compat) — si tu veux juste la liste de la 1ʳᵉ page (4 items) */
  getNotificationsForCurrentUser(): Observable<Notification[]> {
    return this.getPageForCurrentUser({ page: 1, per_page: 4 })
      .pipe(map(p => p.items));
  }

  /**
   * (Optionnel) — récupérer "tout" en demandant une grosse page.
   * Attention: le back cappe à MAX_PER_PAGE (dans ton Flask).
   */
  getAllNotifications(perPage = 1000): Observable<Notification[]> {
    if (this.userId === null) return of([]);
    const params = this.buildParams({ page: 1, per_page: perPage, sort: '-date_envoi,id' });

    return this.http
      .get<Paginated<NotificationDto>>(`${this.baseUrl}/notifications/${this.userId}`, { params })
      .pipe(
        map(res => (res.items ?? []).map(dto => new Notification(
          dto.notification_id,
          dto.titre,
          dto.contenu,
          dto.date_envoi,
          dto.est_lu
        ))),
        tap(list => this.notifications = list)
      );
  }



  // --- utilitaires locaux (inchangés) ---
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.est_lu).length;
  }
  getUnreadTotal(): Observable<number> {
  if (this.userId === null) return of(0);

  // on ne veut QUE le total des non lues => est_lu=false, une mini page suffit
  const params = new HttpParams()
    .set('page', '1')
    .set('per_page', '1')
    .set('est_lu', 'false');

  return this.http
    .get<{ items: any[]; meta: { total: number } }>(`${this.baseUrl}/notifications/${this.userId}`, { params })
    .pipe(map(res => res.meta.total));
}
  deleteById(id: number): void {
    const i = this.notifications.findIndex(n => n.notification_id === id);
    if (i !== -1) this.notifications.splice(i, 1);
  }
  addNotification(n: Notification): void {
    this.notifications.unshift(n);
  }
  private unreadTotalSubject = new BehaviorSubject<number>(0);
  readonly unreadTotal$ = this.unreadTotalSubject.asObservable();

  // garde ta méthode existante si tu veux, mais ajoute ça :
  refreshUnreadTotal(): void {
    if (this.userId === null) { this.unreadTotalSubject.next(0); return; }

    const params = new HttpParams()
      .set('page', '1')
      .set('per_page', '1')
      .set('est_lu', 'false');

    this.http
      .get<{ meta: { total: number } }>(`${this.baseUrl}/notifications/${this.userId}`, { params })
      .subscribe({
        next: res => this.unreadTotalSubject.next(res.meta.total),
        error: _  => this.unreadTotalSubject.next(0)
      });
  }

  setSeen(notificationId: number, seen: boolean): Observable<any> {
    if (!this.userId) { return throwError(() => new Error('Utilisateur non identifié')); }
    const action = seen ? 'read' : 'unread';
    return this.http
      .put<{ message: string; notification: any }>(
        `${this.baseUrl}/notifications/${this.userId}/${notificationId}/${action}`, {}
      )
      .pipe(
        tap(() => {
          const n = this.notifications.find(x => x.notification_id === notificationId);
          if (n) n.est_lu = seen;       // maj locale
          this.refreshUnreadTotal();     // 👈 maj du badge global
        })
      );
  }

}
