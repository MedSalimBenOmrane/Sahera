// notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Notification } from 'src/app/models/notification.model';
import { NotificationService } from 'src/app/services/notification.service';

type Meta = {
  total: number; page: number; per_page: number; pages: number;
  has_next: boolean; has_prev: boolean; next: string | null; prev: string | null;
};

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;

  // --- pagination ---
  meta?: Meta;
  currentPage = 1;
  perPage = 4; // ← 4 par page
  get totalPages(): number { return this.meta?.pages ?? 1; }
  // petite fenêtre glissante (±2 pages autour)
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void { this.loadPage(1); }

  private loadPage(page: number): void {
    this.isLoading = true;
    this.notificationService
      .getPageForCurrentUser({ page, per_page: this.perPage, sort: '-date_envoi,id' })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: ({ items, meta }) => {
          this.notifications = items;
          this.meta = meta as Meta;
          this.currentPage = this.meta.page;
        },
        error: err => {
          console.error('Erreur chargement notifications', err);
          this.notifications = [];
          this.meta = undefined;
        }
      });
  }

  // --- handlers pagination ---
  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.loadPage(p);
  }
  firstPage(): void { this.goToPage(1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  lastPage(): void { this.goToPage(this.totalPages); }

  // --- marquer lu / non-lu (idéal: l'enfant émet l'id plutôt que l'index)
  onToggleSeen(payload: { id?: number; index?: number; seen: boolean }): void {
    // supporte soit payload.id, soit payload.index
    const notif = (payload.id != null)
      ? this.notifications.find(n => n.id === payload.id)
      : this.notifications[payload.index!];

    if (!notif) return;

    this.notificationService.setSeen(notif.id, payload.seen).subscribe({
      next: () => { /* ok */ },
      error: err => {
        console.error('Impossible de changer le statut', err);
        // revert local si besoin
        notif.est_lu = !payload.seen;
      }
    });
  }
}
