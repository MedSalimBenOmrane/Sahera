// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NotificationDto, Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'http://localhost:5000/api';
  private userId: number | null;
  private notifications: Notification[] = [];

  constructor(private http: HttpClient) {
    const usr = JSON.parse(localStorage.getItem('user') || 'null');
    this.userId = usr?.id ?? null;
  }

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

  /** Récupère du back et stocke localement */
getAllNotifications(): Observable<Notification[]> {
  if (this.userId === null) return of([]);
  return this.http
    .get<NotificationDto[]>(`${this.baseUrl}/notifications/${this.userId}`)
    .pipe(
      map(dtos =>
        dtos
          // On transforme en Notification
          .map(dto =>
            new Notification(
              dto.notification_id,
              dto.titre,
              dto.contenu,
              dto.date_envoi,
              dto.est_lu
            )
          )
          // Tri du plus récent au plus ancien
          .sort((a, b) => b.date.getTime() - a.date.getTime())
      ),
      tap(sortedList => this.notifications = sortedList)
    );
}


  /**
   * Surcharge :
   *  - (idx, seen) mets à jour localement.
   *  - (notificationId) renvoie l’Observable pour marquer comme lu au back.
   */
setSeen(notificationId: number, seen: boolean): Observable<any> {
  if (!this.userId) {
    return throwError(() => new Error('Utilisateur non identifié'));
  }

  const action = seen ? 'read' : 'unread';
  return this.http
    .put<{ message: string; notification: any }>(
      `${this.baseUrl}/notifications/${this.userId}/${notificationId}/${action}`,
      {}
    )
    .pipe(
      tap(() => {
        // Mise à jour locale
        const n = this.notifications.find(x => x.notification_id === notificationId);
        if (n) {
          n.est_lu = seen;
        }
      })
    );
}

  /** Compte localement les non–lues */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.est_lu).length;
  }

  /** Supprime localement */
  deleteById(id: number): void {
    const i = this.notifications.findIndex(n => n.notification_id === id);
    if (i !== -1) this.notifications.splice(i, 1);
  }

  /** Ajoute localement en tête de liste */
  addNotification(n: Notification): void {
    this.notifications.unshift(n);
  }
}
