// src/app/models/notification.model.ts
export interface Notification {
  objet: string;
  sender: string;
  date: Date;
  message: string;
  seen: boolean;
}
