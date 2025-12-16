export interface Admin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe?: string;
  mail_sender_email?: string;
  mail_sender_name?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_use_tls?: boolean;
  smtp_username?: string;
  smtp_password?: string;
}
