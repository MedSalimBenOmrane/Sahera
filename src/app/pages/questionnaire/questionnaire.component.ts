import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Thematique } from 'src/app/models/thematique.model';
import { ThematiqueService } from 'src/app/services/thematique.service';

interface QuestionnaireCard {
  title: string;
  description: string;
  publicationDate: string;    // ex. '2025-04-10T09:00:00'
  isSessionOpen: boolean;     // true = ouvert, false = fermé
  sessionCloseDate: string;   // ex. '2025-06-01T23:59:59'
  // (éventuellement, rajoutez d'autres champs si besoin)
}
@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {
isLoading = false; 
  /** Tableau de démonstration */
  questionnaires: QuestionnaireCard[] = [];
  thematiques: Thematique[] = [];
  constructor(    private thematiqueService: ThematiqueService,
    private router: Router  ) { }

  ngOnInit(): void {
    // 1. On récupère toutes les thématiques en mémoire
    this.loadThematiques();
  }

private loadThematiques(): void {
    this.isLoading = true;          // ← démarrage du loader
    this.thematiqueService.getAll().subscribe({
      next: (data: Thematique[]) => {
        this.thematiques = data;
        this.isLoading = false;     // ← arrêt du loader
      },
      error: err => {
        console.error('Erreur récupération thématiques :', err);
        this.thematiques = [];
        this.isLoading = false;     // ← aussi en cas d’erreur
      }
    });
  }

  /**
   * Détermine si la session est encore ouverte :
   * true si la date actuelle est antérieure à dateFermetureSession
   */
  isSessionOpen(t: Thematique): boolean {
    const now = new Date();
    return now < new Date(t.dateFermetureSession);
  }

  /** Méthode appelée lorsqu’on clique sur “Répondre” (éventuellement) */


}
