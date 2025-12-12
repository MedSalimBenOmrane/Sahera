import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from 'src/app/models/question.model';
import { Reponse } from 'src/app/models/reponse.model';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';

type ToastType = 'success' | 'error';

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
  isLoadingST = false;

  // 2) Questions par ST
  questionsMap: { [stId: number]: Question[] } = {};
  loadingQuestionsMap: { [stId: number]: boolean } = {};

  // 3) Réponses & IDs existantes
  reponses: { [stId: number]: { [questionId: number]: string } } = {};
  repIdMap: { [stId: number]: { [qId: number]: number } } = {};

  // Toast
  toast = { show: false, message: '', type: 'success' as ToastType, timer: 0 };

  private userId!: number;

  constructor(
    private route: ActivatedRoute,
    private sousThematiqueService: SousThematiqueService,
    private questionService: QuestionService,
    private reponseService: ReponseService
  ) {}

  ngOnInit(): void {
    const usr = localStorage.getItem('user');
    if (usr) this.userId = JSON.parse(usr).id;

    this.route.paramMap.subscribe(params => {
      this.thematiqueId   = +(params.get('id')!);
      this.thematiqueTitre = params.get('titre') || '';
      this.loadSousThematiques();
    });
  }

  // ========== Helpers UI ==========
  private showToast(message: string, type: ToastType = 'error', durationMs = 3000): void {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;

    // reset timer
    if (this.toast.timer) {
      window.clearTimeout(this.toast.timer);
    }
    this.toast.timer = window.setTimeout(() => (this.toast.show = false), durationMs);
  }

  getQuestions(st: SousThematique): Question[] {
    return this.questionsMap[st.id] || [];
  }

  /** Retourne les options de la question si type 'liste' */
  getOptions(q: Question): string[] {
    if (q.type !== 'liste') return [];
    return Array.isArray(q.options) ? q.options : [];
  }

  // ========== Chargements ==========
  private loadSousThematiques(): void {
    this.isLoadingST = true;
    this.sousThematiqueService.getByThematique(this.thematiqueId).subscribe({
      next: listST => {
        this.sousThematiques = listST;
        this.isLoadingST = false;
        // charger les questions pour chaque ST
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
        // init réponses + ids
        this.reponses[stId] = {};
        this.repIdMap[stId]  = {};
        listQ.forEach(q => (this.reponses[stId][q.id] = ''));

        // charger réponses existantes
        this.reponseService.getByClientSousThematique(this.userId, stId).subscribe({
          next: existing => {
            // map pour accès rapide question par id
            const byId = new Map<number, Question>(this.questionsMap[stId].map(q => [q.id, q]));
            existing.forEach(r => {
              const q = byId.get(r.question_id);
              if (!q) return;

              // injecter la valeur dans les options seulement pour les questions de type liste
              if (q.type === 'liste') {
                const opts = this.getOptions(q);
                if (r.contenu && !opts.includes(r.contenu)) {
                  (q as any).options = [r.contenu, ...opts];
                }
              }
              this.reponses[stId][r.question_id] = r.contenu || '';
              this.repIdMap[stId][r.question_id] = r.reponse_id;
            });

            this.loadingQuestionsMap[stId] = false;
          },
          error: err => {
            console.error('Erreur chargement réponses', err);
            this.loadingQuestionsMap[stId] = false;
          }
        });
      },
      error: err => {
        console.error('Erreur chargement questions', err);
        this.questionsMap[stId] = [];
        this.loadingQuestionsMap[stId] = false;
      }
    });
  }

  // ========== Sauvegarde ==========
  saveReponses(st: SousThematique): void {
    const stId = st.id;
    const questions = this.getQuestions(st);
    if (!questions.length) {
      this.showToast('Aucune question à enregistrer.', 'error');
      return;
    }

    // Validation: toutes les questions doivent être renseignées
    const manquantes: number[] = [];
    for (const q of questions) {
      const val = (this.reponses[stId][q.id] || '').trim();
      if (!val) {
        manquantes.push(q.id);
      }
    }
    if (manquantes.length) {
      this.showToast('Veuillez renseigner chaque question.', 'error');
      return;
    }

    // Envoi
    let total = 0;
    let done = 0;
    let failed = false;

    for (const q of questions) {
      const texte = (this.reponses[stId][q.id] || '').trim();
      const existingId = this.repIdMap[stId][q.id];

      let obs$;
      if (existingId) {
        const rep = new Reponse(existingId, texte, new Date(), q.id, this.userId);
        obs$ = this.reponseService.update(rep);
      } else {
        const rep = new Reponse(0, texte, new Date(), q.id, this.userId);
        obs$ = this.reponseService.create(rep);
      }

      total++;
      obs$.subscribe({
        next: saved => {
          if (!existingId) {
            this.repIdMap[stId][q.id] = saved.id; // id créé
          }
        },
        error: err => {
          failed = true;
          console.error('Erreur enregistrement', err);
        },
        complete: () => {
          done++;
          if (done === total) {
            if (failed) {
              this.showToast('Certaines réponses n’ont pas pu être enregistrées.', 'error', 4000);
            } else {
              this.showToast(`Vos réponses pour « ${st.titre} » ont été enregistrées.`, 'success');
            }
          }
        }
      });
    }
  }
}
