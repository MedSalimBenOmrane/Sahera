// src/app/components/notification/notification.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Notification } from 'src/app/models/notification.model';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  @Input() notification!: Notification;
  @Input() index!: number;
  @Input() isAdminView: boolean = false;
  @Output() deleteNotification = new EventEmitter<number>();

  onDelete(id: number): void {
  this.deleteNotification.emit(id);
}
  /** 
   * On émet un objet { index: number, seen: boolean } 
   * vers le parent pour qu’il mette à jour le service. 
   */
  @Output() toggleSeen = new EventEmitter<{ index: number; seen: boolean }>();

  isShown = false; // pour basculer l’affichage du message complet

  constructor(private notificationServices: NotificationService) { }

  ngOnInit(): void { }

  /** Affiche ou masque le texte complet */
  toggleText(): void {
    this.isShown = !this.isShown;
  }

  /**
   * Quand l’utilisateur coche/décoche la “cyberpunk-checkbox”,
   * on émet l’événement vers le composant parent.
   */
  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.toggleSeen.emit({ index: this.index, seen: input.checked });
  }
 
}
