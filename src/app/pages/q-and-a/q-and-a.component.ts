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
  repIdMap: { [stId: number]: { [qId: number]: number } } = {};
  /** Tableau des sous-thématiques récupérées depuis l’API */
  sousThematiques: SousThematique[] = [];

  /**
   * questionsMap[<idSousThematique>] = Question[]
   * Permet de stocker les questions une fois récupérées pour chaque sous-thématique.
   */
  questionsMap: { [sousThId: number]: Question[] } = {};
  reponses: { [sousThId: number]: { [questionId: number]: string } } = {};
  private userId!: number;
  constructor(
    private route: ActivatedRoute,
    private sousThematiqueService: SousThematiqueService,
    private questionService: QuestionService,
    private reponseService: ReponseService
  ) {}

    ngOnInit(): void {
    // 1) Récupère l'utilisateur connecté dans le localStorage
    const usr = localStorage.getItem('user');
    if (usr) {
      const userObj = JSON.parse(usr);
      this.userId = userObj.id;
    } else {
      console.warn('Utilisateur non trouvé en session');
    }

    // 2) Lecture des params et chargement
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const titreParam = params.get('titre');
      if (idParam) { this.thematiqueId = +idParam; }
      if (titreParam) { this.thematiqueTitre = titreParam; }
      this.loadSousThematiques(this.thematiqueId);
    });
  }

  private loadSousThematiques(thematiqueId: number): void {
    this.sousThematiqueService.getByThematique(thematiqueId)
      .subscribe(listST => {
        this.sousThematiques = listST;
        // pour chaque st, on prépare un objet vide et on charge ses questions
        for (const st of listST) {
          this.reponses[st.id] = {};
          this.loadQuestionsForSousThematique(st.id);
        }
      });
  }

private loadQuestionsForSousThematique(stId: number): void {
  this.questionService.getBySousThematique(stId)
    .subscribe(listQ => {
      this.questionsMap[stId] = listQ;

      // ← Initialise ici à chaque chargement de questions
      this.reponses[stId]  = {};
      this.repIdMap[stId]  = {};

      // Prépare les champs vides
      listQ.forEach(q => this.reponses[stId][q.id] = '');

      // Charge l’existant
      this.reponseService
        .getByClientSousThematique(this.userId, stId)
        .subscribe(existing => {
          existing.forEach(r => {
            this.reponses[stId][r.question_id]    = r.contenu;
            this.repIdMap[stId][r.question_id]    = r.reponse_id;
          });
        });
    });
}

  getQuestions(st: SousThematique): Question[] {
    return this.questionsMap[st.id] || [];
  }

  /**
   * Pour chaque question de la sous-thématique, on crée une Reponse
   * et on l'envoie au back.
   */
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