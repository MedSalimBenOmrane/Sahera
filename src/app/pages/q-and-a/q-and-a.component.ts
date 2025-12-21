import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question } from 'src/app/models/question.model';
import { Reponse } from 'src/app/models/reponse.model';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';
import { TranslationService } from 'src/app/services/translation.service';

type ToastType = 'success' | 'error';
type ResponseValue = string | string[];

@Component({
  selector: 'app-q-and-a',
  templateUrl: './q-and-a.component.html',
  styleUrls: ['./q-and-a.component.css']
})
export class QAndAComponent implements OnInit, OnDestroy {
  thematiqueId!: number;
  thematiqueTitre!: string;

  sousThematiques: SousThematique[] = [];
  isLoadingST = false;

  questionsMap: { [stId: number]: Question[] } = {};
  loadingQuestionsMap: { [stId: number]: boolean } = {};

  reponses: { [stId: number]: { [questionId: number]: ResponseValue } } = {};
  repIdMap: { [stId: number]: { [qId: number]: number } } = {};

  toast = { show: false, message: '', type: 'success' as ToastType, timer: 0 };

  private userId!: number;
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private sousThematiqueService: SousThematiqueService,
    private questionService: QuestionService,
    private reponseService: ReponseService,
    public i18n: TranslationService
  ) {}

  ngOnInit(): void {
    const usr = localStorage.getItem('user');
    if (usr) this.userId = JSON.parse(usr).id;

    this.route.paramMap.subscribe(params => {
      this.thematiqueId   = +(params.get('id')!);
      this.thematiqueTitre = params.get('titre') || '';
      this.loadSousThematiques();
    });

    this.langSub = this.i18n.language$.subscribe(() => {
      this.questionsMap = {};
      this.reponses = {};
      this.repIdMap = {};
      this.loadSousThematiques();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private showToast(key: string, type: ToastType = 'error', durationMs = 3000, params?: Record<string,string>): void {
    this.toast.message = this.i18n.translate(key, params);
    this.toast.type = type;
    this.toast.show = true;

    if (this.toast.timer) {
      window.clearTimeout(this.toast.timer);
    }
    this.toast.timer = window.setTimeout(() => (this.toast.show = false), durationMs);
  }

  getQuestions(st: SousThematique): Question[] {
    return this.questionsMap[st.id] || [];
  }

  private normalizeType(type: Question['type'] | string | undefined): string {
    return String(type || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  isMultiSelectQuestion(q: Question): boolean {
    return this.normalizeType(q.type) === 'liste_multiple';
  }

  isSingleSelectQuestion(q: Question): boolean {
    return this.normalizeType(q.type) === 'liste';
  }

  getOptions(q: Question): string[] {
    if (!this.isSingleSelectQuestion(q) && !this.isMultiSelectQuestion(q)) return [];
    return Array.isArray(q.options) ? q.options : [];
  }

  private parseMultiAnswer(value?: ResponseValue | null): string[] {
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(Boolean);
    }
    if (!value) return [];
    const raw = String(value).trim();
    if (!raw) return [];
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(v => String(v).trim()).filter(Boolean);
        }
      } catch {
        // fallback to separator parsing
      }
    }
    const parts = raw
      .split(/\s*\/\s*/)
      .map(v => v.trim())
      .filter(Boolean);
    return parts.length ? parts : [raw];
  }

  private getMultiSelection(value: ResponseValue | undefined): string[] {
    return this.parseMultiAnswer(value);
  }

  private normalizeMultiAnswer(value: ResponseValue | undefined): string[] {
    return this.parseMultiAnswer(value);
  }

  isOptionSelected(stId: number, qId: number, opt: string): boolean {
    const current = this.getMultiSelection(this.reponses[stId]?.[qId]);
    return current.includes(opt);
  }

  onOptionToggle(stId: number, q: Question, opt: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = new Set(this.getMultiSelection(this.reponses[stId]?.[q.id]));
    if (checked) {
      current.add(opt);
    } else {
      current.delete(opt);
    }
    const options = this.getOptions(q);
    const ordered = options.filter(o => current.has(o));
    const extras = Array.from(current).filter(o => !options.includes(o));
    this.reponses[stId][q.id] = [...ordered, ...extras];
  }

  private isMissingAnswer(stId: number, q: Question): boolean {
    const val = this.reponses[stId]?.[q.id];
    if (this.isMultiSelectQuestion(q)) {
      return this.normalizeMultiAnswer(val).length === 0;
    }
    return !String(val ?? '').trim();
  }

  private loadSousThematiques(): void {
    this.isLoadingST = true;
    this.sousThematiqueService.getByThematique(this.thematiqueId).subscribe({
      next: listST => {
        this.sousThematiques = listST;
        this.isLoadingST = false;
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
        this.reponses[stId] = {};
        this.repIdMap[stId]  = {};
        listQ.forEach(q => (this.reponses[stId][q.id] = this.isMultiSelectQuestion(q) ? [] : ''));

        this.reponseService.getByClientSousThematique(this.userId, stId).subscribe({
          next: existing => {
            const byId = new Map<number, Question>(this.questionsMap[stId].map(q => [q.id, q]));
            existing.forEach(r => {
              const q = byId.get(r.question_id);
              if (!q) return;

              if (this.isSingleSelectQuestion(q)) {
                const opts = this.getOptions(q);
                if (r.contenu && !opts.includes(r.contenu)) {
                  (q as any).options = [r.contenu, ...opts];
                }
                this.reponses[stId][r.question_id] = r.contenu || '';
              } else if (this.isMultiSelectQuestion(q)) {
                const selected = this.parseMultiAnswer(r.contenu);
                const opts = this.getOptions(q);
                const extras = selected.filter(v => v && !opts.includes(v));
                if (extras.length) {
                  (q as any).options = [...extras, ...opts];
                }
                this.reponses[stId][r.question_id] = selected;
              } else {
                this.reponses[stId][r.question_id] = r.contenu || '';
              }
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

  saveReponses(st: SousThematique): void {
    const stId = st.id;
    const questions = this.getQuestions(st);
    if (!questions.length) {
      this.showToast('qna.toast.none', 'error');
      return;
    }

    const manquantes: number[] = [];
    for (const q of questions) {
      if (this.isMissingAnswer(stId, q)) {
        manquantes.push(q.id);
      }
    }
    if (manquantes.length) {
      this.showToast('qna.toast.missing', 'error');
      return;
    }

    let total = 0;
    let done = 0;
    let failed = false;

    for (const q of questions) {
      const texte = this.isMultiSelectQuestion(q)
        ? this.normalizeMultiAnswer(this.reponses[stId][q.id])
        : String(this.reponses[stId][q.id] || '').trim();
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
            this.repIdMap[stId][q.id] = saved.id;
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
              this.showToast('qna.toast.partial', 'error', 4000);
            } else {
              this.showToast('qna.toast.saved', 'success', 3000, { title: st.titre });
            }
          }
        }
      });
    }
  }
}
