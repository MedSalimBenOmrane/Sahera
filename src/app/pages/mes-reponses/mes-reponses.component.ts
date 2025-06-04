import { Component, OnInit } from '@angular/core';


interface ResponseCard {
  title: string;
  description: string;
  publicationDate: Date;   // ISO string ou « 2025-05-01T12:00:00 »
  isSessionOpen: boolean;
  sessionCloseDate: Date;
  isAnswered: boolean;       // true si l’utilisateur a déjà fini
  responseDate?: string;     // date de réponse, uniquement si isAnswered === true
  // (optionnel) id ou tout autre champ pour identifier la réponse à modifier/supprimer
}
@Component({
  selector: 'app-mes-reponses',
  templateUrl: './mes-reponses.component.html',
  styleUrls: ['./mes-reponses.component.css']
})
export class MesReponsesComponent implements OnInit {
    /** Exemple de données pour illustrer 6 cartes */
  responses: ResponseCard[] = [];

  constructor() { }

  ngOnInit(): void {
    this.responses = [
      {
        title: 'Enquête de satisfaction Client B2B',
        description: 'Merci de répondre à ces quelques questions pour nous aider à améliorer notre service…',
        publicationDate: new Date('2025-04-15'),
        isSessionOpen: true,
        sessionCloseDate:new Date('2025-09-15'),
        isAnswered: false
        // responseDate n’est pas défini ici car isAnswered === false
      },
      {
        title: 'Audit interne Qualité',
        description: 'Votre retour sur les procédures internes est précieux. Cette enquête est confidentielle…',
        publicationDate: new Date('2025-04-15'),
        isSessionOpen: false,
        sessionCloseDate: new Date('2025-09-15'),
        isAnswered: true,
        responseDate: '2025-05-18T14:23:00'
      },
      {
        title: 'Enquête de satisfaction Client B2B',
        description: 'Merci de répondre à ces quelques questions pour nous aider à améliorer notre service…',
        publicationDate:  new Date('2025-04-15'),
        isSessionOpen: true,
        sessionCloseDate: new Date('2025-09-15'),
        isAnswered: false
        // responseDate n’est pas défini ici car isAnswered === false
      },
      {
        title: 'Audit interne Qualité',
        description: 'Votre retour sur les procédures internes est précieux. Cette enquête est confidentielle…',
        publicationDate:  new Date('2025-04-15'),
        isSessionOpen: false,
        sessionCloseDate: new Date('2025-09-15'),
        isAnswered: true,
        responseDate: '2025-05-18T14:23:00'
      },
      // … 4 autres objets similaires
    ];
  }

  /** Méthode à appeler quand l’utilisateur clique sur Modifier (par ex.) */
  onModify(response: ResponseCard) {
    console.log('Modifier la réponse pour :', response);
    // redirection vers le formulaire pré-rempli, etc.
  }

  /** Méthode à appeler quand l’utilisateur clique sur Supprimer */
  onDelete(response: ResponseCard) {
    console.log('Supprimer la réponse pour :', response);
    // affichage d’une modale de confirmation, puis suppression réelle, etc.
  }

}
