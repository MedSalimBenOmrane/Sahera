import { Injectable } from '@angular/core';
import { Notification } from '../models/notification.model';
import { Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
// Tableau prérempli de deux notifications d'exemple
  private notifications: Notification[] = [
    {
      id:1,
      objet: 'Lancement de la plateforme clinique',
      sender: 'Hera Care Solutions',
      date: new Date('2025-06-06T09:00:00'),
      message: `Bonjour,

Nous avons le plaisir de vous informer que dans le cadre de notre étude clinique sur le dispositif médical Sahera, nous venons de lancer une plateforme web sécurisée destinée à recueillir les données des participantes tout au long de la période d’évaluation. Cette plateforme a été développée afin de garantir une collecte fiable, structurée et conforme aux exigences réglementaires en matière de données de santé, notamment le RGPD.

L’outil permettra à 50 participantes d’accéder à un questionnaire thématique et personnalisé. Côté administration, il offre la possibilité de gérer dynamiquement les utilisateurs, les questions et les thématiques, tout en assurant un suivi analytique des réponses avec des visualisations et des exports en temps réel. La conception technique repose sur une architecture robuste combinant Angular pour le frontend, Flask pour le backend, et une base de données MySQL hébergée sur l’infrastructure sécurisée d’AWS.

Ce projet s’inscrit dans notre engagement à proposer une solution innovante, non médicamenteuse et personnalisée, visant à soulager efficacement les douleurs menstruelles et à accompagner les femmes dans la gestion de leur cycle hormonal.

Nous restons disponibles pour vous fournir un accès à la plateforme dans le cadre de collaborations, de tests ou de validation réglementaire. N'hésitez pas à nous contacter pour toute information complémentaire.

Cordialement,
L’équipe Hera Care Solutions`,
      seen: false
    },
    { id: 2,
      objet: 'Mise à jour de sécurité serveur',
      sender: 'Admin IT',
      date: new Date('2025-06-07T14:30:00'),
      message: `Chère utilisatrice, cher utilisateur,

Nous souhaitons vous informer qu’une maintenance de sécurité sera effectuée sur nos serveurs le 08/06/2025 de 01:00 à 03:00. Durant cette plage horaire, la plateforme pourrait être temporairement indisponible. Veuillez prendre vos dispositions pour sauvegarder vos données avant cette intervention.

Merci de votre compréhension.

Cordialement,
L’équipe IT`,
      seen: false
    }
  ];

  constructor() { }
getAllNotifications(): Notification[] {
    return this.notifications;
  }

   setSeen(idx: number, seen: boolean): void {
    if (idx >= 0 && idx < this.notifications.length) {
      this.notifications[idx].seen = seen;
    }
  }

  /** Renvoie le nombre de notifications non lues */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.seen).length;
  }
deleteById(id: number): void {
  const index = this.notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    this.notifications.splice(index, 1);
  }
}
addNotification(n: Notification): void {
  this.notifications.unshift(n); // ou push(n) si tu veux en bas
}
}
