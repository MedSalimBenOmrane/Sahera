// src/app/models/notification.model.ts
export interface Notification {
  id:number;
  objet: string;
  sender: string;
  date: Date;
  message: string;
  seen: boolean;
}
