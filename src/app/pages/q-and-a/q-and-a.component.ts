import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Question } from 'src/app/models/question.model';
import { Reponse } from 'src/app/models/reponse.model';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { NotificationService } from 'src/app/services/notification.service';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';
import { TranslationService } from 'src/app/services/translation.service';

type ToastType = 'success' | 'error';
type ResponseValue = string | string[];
type InlineNotice = { message: string; type: ToastType; timer?: number };
type TabStatus = 'default' | 'incomplete' | 'complete';

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
  private readonly questionChunkSize = 3;
  visibleQuestionCounts: { [stId: number]: number } = {};
  readonly isIOS = this.detectIOS();

  reponses: { [stId: number]: { [questionId: number]: ResponseValue } } = {};
  repIdMap: { [stId: number]: { [qId: number]: number } } = {};

  inlineNotices: { [stId: number]: InlineNotice } = {};
  activeIndex = 0;
  tabStatusMap: { [stId: number]: TabStatus } = {};

  private userId!: number;
  private langSub?: Subscription;
  private tabStorageKey = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sousThematiqueService: SousThematiqueService,
    private questionService: QuestionService,
    private reponseService: ReponseService,
    private toastr: ToastrService,
    private notificationService: NotificationService,
    public i18n: TranslationService
  ) {}

  ngOnInit(): void {
    const usr = localStorage.getItem('user');
    if (usr) this.userId = JSON.parse(usr).id;

    this.route.paramMap.subscribe(params => {
      this.thematiqueId   = +(params.get('id')!);
      this.thematiqueTitre = params.get('titre') || '';
      this.tabStorageKey = `qna-tab-status-${this.userId || 'anon'}-${this.thematiqueId}`;
      this.loadSousThematiques();
    });

    this.langSub = this.i18n.language$.subscribe(() => {
      this.questionsMap = {};
      this.loadingQuestionsMap = {};
      this.reponses = {};
      this.repIdMap = {};
      this.visibleQuestionCounts = {};
      this.loadSousThematiques();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    Object.values(this.inlineNotices).forEach(notice => {
      if (notice.timer) window.clearTimeout(notice.timer);
    });
  }

  private setInlineNotice(stId: number, key: string, type: ToastType = 'error', durationMs = 3000, params?: Record<string,string>): void {
    const message = this.i18n.translate(key, params);
    const existing = this.inlineNotices[stId];
    if (existing?.timer) {
      window.clearTimeout(existing.timer);
    }
    const timer = window.setTimeout(() => {
      delete this.inlineNotices[stId];
    }, durationMs);
    this.inlineNotices[stId] = { message, type, timer };
  }

  setActiveIndex(index: number, scroll = false): void {
    this.activeIndex = index;
    this.ensureQuestionsLoaded(index);
    if (scroll) this.scrollToTop();
  }

  getTabStatusClass(stId: number): string {
    const status = this.tabStatusMap[stId] || 'default';
    return `tab-status-${status}`;
  }

  isLastSousThematique(st: SousThematique): boolean {
    if (!this.sousThematiques.length) return false;
    return this.sousThematiques[this.sousThematiques.length - 1].id === st.id;
  }

  getQuestions(st: SousThematique): Question[] {
    return this.questionsMap[st.id] || [];
  }

  trackBySousThematique(_index: number, st: SousThematique): number {
    return st.id;
  }

  trackByQuestion(_index: number, q: Question): number {
    return q.id;
  }

  trackByOption(_index: number, opt: string): string {
    return opt;
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
        this.activeIndex = 0;
        this.inlineNotices = {};
        this.tabStatusMap = this.loadTabStatusFromStorage();
        for (const st of listST) {
          if (!this.tabStatusMap[st.id]) {
            this.tabStatusMap[st.id] = 'default';
          }
        }
        this.persistTabStatus();
        this.ensureQuestionsLoaded(this.activeIndex);
      },
      error: err => {
        console.error('Erreur chargement ST', err);
        this.sousThematiques = [];
        this.isLoadingST = false;
      }
    });
  }

  private detectIOS(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isIPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
    const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    return isIOS || isIPadOS || isCoarse;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private goToNextSousThematique(currentStId: number): void {
    const currentIndex = this.sousThematiques.findIndex(st => st.id === currentStId);
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < this.sousThematiques.length) {
      this.setActiveIndex(nextIndex, true);
    } else {
      this.scrollToTop();
    }
  }

  private setTabStatus(stId: number, status: TabStatus): void {
    this.tabStatusMap[stId] = status;
    this.persistTabStatus();
  }

  private markNonCompletedAsIncomplete(): void {
    this.sousThematiques.forEach(st => {
      if (this.tabStatusMap[st.id] !== 'complete') {
        this.tabStatusMap[st.id] = 'incomplete';
      }
    });
    this.persistTabStatus();
  }

  private handleFinalSubmission(): void {
    const allComplete = this.sousThematiques.every(st => this.tabStatusMap[st.id] === 'complete');
    if (allComplete) {
      this.toastr.success(
        this.i18n.translate('qna.toast.submitSuccess'),
        this.i18n.translate('qna.toast.submitSuccessTitle'),
        { positionClass: 'toast-top-right' }
      );
      this.sendCompletionNotification();
      window.setTimeout(() => this.router.navigate(['/mes-reponses']), 800);
      return;
    }

    this.markNonCompletedAsIncomplete();
    this.toastr.error(
      this.i18n.translate('qna.toast.submitIncomplete'),
      this.i18n.translate('qna.toast.submitErrorTitle'),
      { positionClass: 'toast-top-right' }
    );
  }

  private loadQuestionsForSousThematique(stId: number): void {
    this.loadingQuestionsMap[stId] = true;

    this.questionService.getBySousThematique(stId).subscribe({
      next: listQ => {
        this.questionsMap[stId] = listQ;
        this.visibleQuestionCounts[stId] = Math.min(this.questionChunkSize, listQ.length);
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

            this.updateTabStatusFromResponses(stId);
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

  getVisibleQuestions(st: SousThematique): Question[] {
    const list = this.getQuestions(st);
    const limit = this.visibleQuestionCounts[st.id] ?? this.questionChunkSize;
    return list.slice(0, limit);
  }

  canLoadMoreQuestions(st: SousThematique): boolean {
    const list = this.getQuestions(st);
    const limit = this.visibleQuestionCounts[st.id] ?? this.questionChunkSize;
    return list.length > limit;
  }

  loadMoreQuestions(st: SousThematique): void {
    const list = this.getQuestions(st);
    const current = this.visibleQuestionCounts[st.id] ?? this.questionChunkSize;
    this.visibleQuestionCounts[st.id] = Math.min(list.length, current + this.questionChunkSize);
  }

  private ensureQuestionsLoaded(index: number): void {
    const st = this.sousThematiques?.[index];
    if (!st) return;
    if (this.loadingQuestionsMap[st.id]) return;
    if (this.questionsMap[st.id]) return;
    this.loadQuestionsForSousThematique(st.id);
  }

  saveReponses(st: SousThematique): void {
    const stId = st.id;
    const isLast = this.isLastSousThematique(st);
    const questions = this.getQuestions(st);
    if (!questions.length) {
      this.setInlineNotice(stId, 'qna.toast.none', 'error');
      return;
    }

    const manquantes: number[] = [];
    for (const q of questions) {
      if (this.isMissingAnswer(stId, q)) {
        manquantes.push(q.id);
      }
    }
    if (manquantes.length) {
      this.setTabStatus(stId, 'incomplete');
      this.setInlineNotice(stId, 'qna.toast.missing', 'error');
      if (isLast) {
        this.handleFinalSubmission();
      } else {
        this.goToNextSousThematique(stId);
      }
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
              this.setTabStatus(stId, 'incomplete');
              this.setInlineNotice(stId, 'qna.toast.partial', 'error', 4000);
            } else {
              this.setTabStatus(stId, 'complete');
              this.setInlineNotice(stId, 'qna.toast.saved', 'success', 3000, { title: st.titre });
              if (isLast) {
                this.handleFinalSubmission();
              } else {
                const autoAdvanceDelayMs = 600;
                window.setTimeout(() => this.goToNextSousThematique(stId), autoAdvanceDelayMs);
              }
            }
          }
        }
      });
    }
  }

  private loadTabStatusFromStorage(): { [stId: number]: TabStatus } {
    if (!this.tabStorageKey) return {};
    try {
      const raw = localStorage.getItem(this.tabStorageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch {
      return {};
    }
  }

  private persistTabStatus(): void {
    if (!this.tabStorageKey) return;
    localStorage.setItem(this.tabStorageKey, JSON.stringify(this.tabStatusMap));
  }

  private updateTabStatusFromResponses(stId: number): void {
    const questions = this.questionsMap[stId] || [];
    if (!questions.length) return;
    const savedCount = Object.keys(this.repIdMap[stId] || {}).length;
    if (savedCount === 0) return;
    const missing = questions.some(q => this.isMissingAnswer(stId, q));
    this.setTabStatus(stId, missing ? 'incomplete' : 'complete');
  }

  private sendCompletionNotification(): void {
    if (!this.userId) return;

    const name = this.getUserDisplayName();
    const namePart = name ? ` ${name}` : '';
    const participe = this.isFemaleUser() ? 'consacrée' : 'consacré';
    const subject = `Merci${namePart} pour le temps que vous avez ${participe} à cette enquête.`;
    const message = [
      '**Français**',
      'Merci d’avoir pris le temps de répondre à cette enquête de satisfaction sur le dispositif d’auriculothérapie SaHera. Vos retours en tant que primo-adaptantes sont particulièrement précieux pour nous aider à améliorer le dispositif',
      '',
      'Si vous souhaitez partager d’autres idées ou suggestions, n’hésitez surtout pas à nous écrire.',
      '',
      '**English**',
      'Thank you for taking the time to complete this satisfaction survey on the SaHera auriculotherapy device. Your feedback as a first-time user is especially valuable in helping us improve the device.',
      'If you would like to share any additional ideas or suggestions, please feel free to contact us.'
    ].join('\n');

    this.notificationService.sendNotification(subject, message, [this.userId]).subscribe({
      next: () => {
        this.notificationService.refreshUnreadTotal();
      },
      error: err => console.error('Envoi notification echoue', err)
    });
  }

  private sendCompletionNotificationHtml(): void {
    if (!this.userId) return;

    const name = this.getUserDisplayName();
    const namePart = name ? ` ${name}` : '';
    const participe = this.isFemaleUser() ? 'consacrée' : 'consacré';
    const subject = `Merci${namePart} pour le temps que vous avez ${participe} à cette enquête.`;
    const message = [
      '**Français**',
      'Merci d’avoir pris le temps de répondre à cette enquête de satisfaction sur le dispositif d’auriculothérapie SaHera. Vos retours en tant que primo-adaptantes sont particulièrement précieux pour nous aider à améliorer le dispositif',
      '',
      'Si vous souhaitez partager d’autres idées ou suggestions, n’hésitez surtout pas à nous écrire.',
      '',
      '**English**',
      'Thank you for taking the time to complete this satisfaction survey on the SaHera auriculotherapy device. Your feedback as a first-time user is especially valuable in helping us improve the device.',
      'If you would like to share any additional ideas or suggestions, please feel free to contact us.'
    ].join('\r\n');

    const htmlMessage = [
      '<!DOCTYPE html>',
      '<html><head><meta charset="UTF-8"></head><body>',
      '<div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#111; line-height:1.6;">',
      '<strong>Français</strong><br>',
      'Merci d’avoir pris le temps de répondre à cette enquête de satisfaction sur le dispositif d’auriculothérapie SaHera. Vos retours en tant que primo-adaptantes sont particulièrement précieux pour nous aider à améliorer le dispositif',
      '<br><br>',
      'Si vous souhaitez partager d’autres idées ou suggestions, n’hésitez surtout pas à nous écrire.',
      '<br><br>',
      '<strong>English</strong><br>',
      'Thank you for taking the time to complete this satisfaction survey on the SaHera auriculotherapy device. Your feedback as a first-time user is especially valuable in helping us improve the device.',
      '<br>',
      'If you would like to share any additional ideas or suggestions, please feel free to contact us.',
      '</div></body></html>'
    ].join('');

    this.notificationService.sendNotification(subject, message, [this.userId], htmlMessage).subscribe({
      next: () => {
        this.notificationService.refreshUnreadTotal();
      },
      error: err => console.error('Envoi notification echoue', err)
    });
  }

  private isFemaleUser(): boolean {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    try {
      const u = JSON.parse(raw) as { genre?: string; gender?: string };
      const g = String(u?.genre ?? u?.gender ?? '').toLowerCase();
      return g.startsWith('f') || g.includes('female') || g.includes('femme') || g.includes('woman');
    } catch {
      return false;
    }
  }

  private getUserDisplayName(): string {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    try {
      const u = JSON.parse(raw) as { nom?: string; prenom?: string };
      const parts = [u.nom, u.prenom].filter(Boolean);
      return parts.join(' ').trim();
    } catch {
      return '';
    }
  }
}
