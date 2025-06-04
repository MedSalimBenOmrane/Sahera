import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/models/question.model';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { QuestionService } from 'src/app/services/question.service';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';

@Component({
  selector: 'app-q-and-a',
  templateUrl: './q-and-a.component.html',
  styleUrls: ['./q-and-a.component.css']
})
export class QAndAComponent implements OnInit {
  thematiqueId!: number;
  thematiqueTitre!: string;

  /** Tableau des sous-thématiques récupérées depuis l’API */
  sousThematiques: SousThematique[] = [];

  /**
   * questionsMap[<idSousThematique>] = Question[]
   * Permet de stocker les questions une fois récupérées pour chaque sous-thématique.
   */
  questionsMap: { [sousThId: number]: Question[] } = {};

  constructor(
    private route: ActivatedRoute,
    private sousThematiqueService: SousThematiqueService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    // 1) Lire “id” et “titre” depuis la route (ex : /qanda/:id/:titre)
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const titreParam = params.get('titre');

      if (idParam) {
        this.thematiqueId = +idParam;
      }
      if (titreParam) {
        this.thematiqueTitre = titreParam;
      }

      // 2) Charger la liste des sous-thématiques
      this.loadSousThematiques(this.thematiqueId);
    });
  }

  private loadSousThematiques(thematiqueId: number): void {
    this.sousThematiqueService.getByThematique(thematiqueId).subscribe(
      (listST: SousThematique[]) => {
        this.sousThematiques = listST;

        // Pour chaque sous-thématique récupérée, on charge ses questions
        for (const st of this.sousThematiques) {
          this.loadQuestionsForSousThematique(st.id);
        }
      },
      err => {
        console.error(
          `Erreur lors du chargement des sous-thématiques pour thematique ${thematiqueId}`,
          err
        );
      }
    );
  }

  /**
   * Charge la liste des questions pour une sous-thématique donnée
   * et stocke le résultat dans questionsMap[stId].
   */
  private loadQuestionsForSousThematique(stId: number): void {
    this.questionService.getBySousThematique(stId).subscribe(
      (listQ: Question[]) => {
        this.questionsMap[stId] = listQ;
      },
      err => {
        console.error(
          `Erreur chargement des questions pour sous-thématique ${stId}`,
          err
        );
        // On initialise quand même une entrée vide pour éviter undefined dans le template
        this.questionsMap[stId] = [];
      }
    );
  }

  /**
   * Renvoie la liste des questions pour la sous-thématique st,
   * ou [] si pas encore chargées.
   */
  getQuestions(st: SousThematique): Question[] {
    return this.questionsMap[st.id] || [];
  }
}