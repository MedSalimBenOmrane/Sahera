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
    this.notificationService.getAllNotifications()
      .subscribe(list =>{
          this.notifications = list;
          // Dès qu'on a la réponse (même vide), on désactive le loader
          this.isLoading = false;
        },
        err => {
          console.error(err);
          // En cas d'erreur aussi, on cache le loader
          this.isLoading = false;
        }
      );
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
    const userIds = [1, 2, 3];  // toujours admin
    this.notificationService
      .sendNotification(this.newNotif.titre, this.newNotif.contenu, userIds)
      .subscribe(res => {
        const dto = res.notification;
        const notif = new Notification(
          dto.id,
          dto.titre,
          dto.contenu,
          dto.date_envoi,
          false
        );
        this.notificationService.addNotification(notif);
        this.notifications = [...this.notificationService['notifications']];
        this.closeDialog();
      });
  }

  onDeleteNotification(id: number): void {
    this.notificationService.deleteById(id);
    this.notifications = [...this.notificationService['notifications']];
  }


}
