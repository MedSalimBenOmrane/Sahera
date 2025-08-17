// src/app/pages/admin/create-notification/create-notification.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';
import {
  Directive,
  HostListener,
  Input,
  Renderer2,
  AfterViewInit
} from '@angular/core';
type Meta = {
  total: number; page: number; per_page: number; pages: number;
  has_next: boolean; has_prev: boolean; next: string|null; prev: string|null;
};
@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})

export class CreateNotificationComponent implements OnInit {
  @Input() revealThreshold = 150;
  notifications: Notification[] = [];
  newNotif = { titre: '', contenu: '' };
  // On ajoute un flag de chargement
  isLoading = false;
  @ViewChild('dialog', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private notificationService: NotificationService,    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2) {}
 @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowEvent() {
    this.checkReveal();
  }
  private checkReveal() {
    const windowHeight = window.innerHeight;
    const elemTop = this.el.nativeElement.getBoundingClientRect().top;

    if (elemTop < windowHeight - this.revealThreshold) {
      this.renderer.addClass(this.el.nativeElement, 'active');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active');
    }
  }
  ngOnInit(): void {
    
    this.isLoading = true;
this.loadPage(1);
    this.checkReveal();
  }

  openCreateDialog(): void {
    this.newNotif = { titre: '', contenu: '' };
    (this.dialogRef.nativeElement as any).showModal();
  }

  closeDialog(): void {
    (this.dialogRef.nativeElement as any).close();
  }

sendNotification(): void {
  const userIds = [1];
  this.notificationService
    .sendNotification(this.newNotif.titre, this.newNotif.contenu, userIds)
    .subscribe({
      next: () => {
        this.closeDialog();
        // recharge l’historique depuis /api/notifications pour respecter le tri -date_envoi,id
        this.loadPage(1);        // ou this.loadPage(this.currentPage);
      },
      error: err => {
        console.error('Envoi notification échoué', err);
      }
    });
}

  onDeleteNotification(id: number): void {
    this.notificationService.deleteById(id);
    this.notifications = [...this.notificationService['notifications']];
  }


  // pagination
  meta?: Meta;
  currentPage = 1;
  perPage = 4;
  get totalPages(): number { return this.meta?.pages ?? 1; }
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }


  private loadPage(page: number): void {
    this.isLoading = true;

    // 👉 OPTION A (historique GLOBAL admin) : nécessite un endpoint /api/notifications (voir section 4)
    this.notificationService.getPageAll({ page, per_page: this.perPage, sort: '-date_envoi,id' })
      .pipe(/* finalize(() => this.isLoading=false) si tu veux */)
      .subscribe({
        next: ({ items, meta }) => {
          this.notifications = items;
          this.meta = meta as Meta;
          this.currentPage = this.meta.page;
          this.isLoading = false;
        },
        error: _ => { this.notifications = []; this.meta = undefined; this.isLoading = false; }
      });

    // 👉 OPTION B (si tu n’as que /notifications/<user_id> pour l’admin) :
    // this.notificationService.getPageForCurrentUser({ page, per_page: this.perPage, sort: '-date_envoi,id' })...
  }

  // handlers pagination
  goToPage(p:number){ if(p<1 || p>this.totalPages || p===this.currentPage) return; this.loadPage(p); }
  firstPage(){ this.goToPage(1); }
  prevPage(){ this.goToPage(this.currentPage-1); }
  nextPage(){ this.goToPage(this.currentPage+1); }
  lastPage(){ this.goToPage(this.totalPages); }


}
