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
    this.isLoading = true;
    this.thematiqueService.getAll().subscribe({
      next: (data) => {
        this.thematiques = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur récupération thématiques :', err);
        this.thematiques = [];
        this.isLoading = false;
      }
    });
  }

  // utilitaire pour normaliser à minuit
  private atMidnight(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  /**
   * Session ouverte ssi today ∈ [ouverture, clôture] (bornes incluses).
   * Si une des deux dates est absente -> fermé.
   */
  isSessionOpen(t: Thematique): boolean {
    if (!t.dateOuvertureSession || !t.dateFermetureSession) return false;

    const today = this.atMidnight(new Date());
    const start = this.atMidnight(t.dateOuvertureSession);
    const end   = this.atMidnight(t.dateFermetureSession);

    return today >= start && today <= end;
  }

  /** Méthode appelée lorsqu’on clique sur “Répondre” (éventuellement) */


}
