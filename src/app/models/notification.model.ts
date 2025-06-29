// src/app/models/notification.model.ts
export interface NotificationDto {
  notification_id: number;
  titre:            string;
  contenu:          string;
  date_envoi:       string;
  est_lu:           boolean;
}

export class Notification {
  constructor(
    public notification_id: number,
    public titre:           string,
    public contenu:         string,
    public date_envoi:      string,
    public est_lu:          boolean,
    public sender:         string = 'Admin'
  ) {}

  // Getters pour matcher vos templates :
  get id(): number       { return this.notification_id; }
  get objet(): string    { return this.titre; }
  get message(): string  { return this.contenu; }
  get date(): Date       { return new Date(this.date_envoi); }
  get seen(): boolean    { return this.est_lu; }
}
