import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/models/question.model';
import { Reponse } from 'src/app/models/reponse.model';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';

@Component({
  selector: 'app-q-and-a',
  templateUrl: './q-and-a.component.html',
  styleUrls: ['./q-and-a.component.css']
})
export class QAndAComponent implements OnInit {
    thematiqueId!: number;
  thematiqueTitre!: string;

  // 1) Sous-thématiques
  sousThematiques: SousThematique[] = [];
  isLoadingST = false; // ← loader page

  // 2) Questions par ST
  questionsMap: { [stId: number]: Question[] } = {};
  loadingQuestionsMap: { [stId: number]: boolean } = {};

  // Réponses existantes
  reponses: { [stId: number]: { [questionId: number]: string } } = {};
  repIdMap: { [stId: number]: { [qId: number]: number } } = {};

  private userId!: number;

  constructor(
    private route: ActivatedRoute,
    private sousThematiqueService: SousThematiqueService,
    private questionService: QuestionService,
    private reponseService: ReponseService
  ) {}

  ngOnInit(): void {
    // Récupération user
    const usr = localStorage.getItem('user');
    if (usr) this.userId = JSON.parse(usr).id;

    this.route.paramMap.subscribe(params => {
      this.thematiqueId   = +params.get('id')!;
      this.thematiqueTitre = params.get('titre') || '';
      this.loadSousThematiques();
    });
  }

  private loadSousThematiques(): void {
    this.isLoadingST = true;
    this.sousThematiqueService.getByThematique(this.thematiqueId)
      .subscribe({
        next: listST => {
          this.sousThematiques = listST;
          this.isLoadingST = false;
          // pour chaque ST on charge ses questions
          for (const st of listST) {
            this.loadQuestionsForSousThematique(st.id);
          }
        },
        error: err => {
          console.error('Erreur chargement ST', err);
          this.sousThematiques = [];
          this.isLoadingST = false;
        }
      });
  }

  private loadQuestionsForSousThematique(stId: number): void {
    this.loadingQuestionsMap[stId] = true;
    this.questionService.getBySousThematique(stId).subscribe({
      next: listQ => {
        this.questionsMap[stId] = listQ;
        // init réponses + IDs existantes
        this.reponses[stId] = {};
        this.repIdMap[stId] = {};
        listQ.forEach(q => this.reponses[stId][q.id] = '');

        // charger réponses existantes
        this.reponseService
          .getByClientSousThematique(this.userId, stId)
          .subscribe(existing => {
            existing.forEach(r => {
              this.reponses[stId][r.question_id] = r.contenu;
              this.repIdMap[stId][r.question_id] = r.reponse_id;
            });
            this.loadingQuestionsMap[stId] = false;
          },
          err => {
            console.error('Erreur chargement réponses', err);
            this.loadingQuestionsMap[stId] = false;
          });
      },
      error: err => {
        console.error('Erreur chargement questions', err);
        this.questionsMap[stId] = [];
        this.loadingQuestionsMap[stId] = false;
      }
    });
  }

  getQuestions(st: SousThematique): Question[] {
    return this.questionsMap[st.id] || [];
  }
  saveReponses(st: SousThematique): void {
    const now = new Date();
    const vals = this.reponses[st.id];
    for (const q of this.getQuestions(st)) {
  const texte = this.reponses[st.id][q.id]?.trim();
  if (texte !== undefined) {
    const existingId = this.repIdMap[st.id][q.id];
    let obs$;

    if (existingId) {
      // on met à jour
      const rep = new Reponse(existingId, texte, now, q.id, this.userId);
      obs$ = this.reponseService.update(rep);
    } else {
      // on crée
      const rep = new Reponse(0, texte, now, q.id, this.userId);
      obs$ = this.reponseService.create(rep);
    }

    obs$.subscribe({
      next: saved => {
        if (!existingId) {
          // si c’était une création, on stocke le nouvel ID
          this.repIdMap[st.id][q.id] = saved.id;
        }
      },
      error: err => console.error('Erreur enregistrement', err)
    });
  }
}
    alert(`Vos réponses pour « ${st.titre} » ont été envoyées.`);
  }
}