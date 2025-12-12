// src/app/components/notification/notification.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  @Input() notification!: Notification;
  @Input() index!: number;
  @Input() isAdminView = false;

  @Output() deleteNotification = new EventEmitter<number>();
  @Output() toggleSeen        = new EventEmitter<{ index: number; seen: boolean }>();

  isShown = false;

  ngOnInit(): void {}

  toggleText(): void {
    this.isShown = !this.isShown;
  }

  onDelete(id: number): void {
    this.deleteNotification.emit(id);
  }

  onCheckboxChange(event: Event): void {
    const seen = (event.target as HTMLInputElement).checked;
    this.toggleSeen.emit({ index: this.index, seen });
  }
}
