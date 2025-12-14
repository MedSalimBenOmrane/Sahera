import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { Question } from 'src/app/models/question.model';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { map, switchMap, of, Subscription } from 'rxjs';
import dialogPolyfill from 'dialog-polyfill';
import { TranslationService } from 'src/app/services/translation.service';

interface Row {
  sous: string;
  question: string;
  count: number;
}

@Component({
  selector: 'app-thematique-details',
  templateUrl: './thematique-details.component.html',
  styleUrls: ['./thematique-details.component.css']
})
export class ThematiqueDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('analysisDialog', { static: true })
  analysisDialog!: ElementRef<HTMLDialogElement>;   // <-- gardée UNE SEULE FOIS

  thematiqueId!: number;
  thematiqueTitre!: string;
  sousThematiques: SousThematique[] = [];

  sortColumn: keyof Row = 'count';
  sortAsc = true;
  rows: Row[] = [];

  questionsMap: { [stId: number]: Question[] } = {};
  responseCountMap: { [qId: number]: number } = {};
  isLoading = false;

  analysis = {
    questionLabel: '',
    options: [] as string[],
    counts: [] as number[],
    loading: false
  };
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private stService: SousThematiqueService,
    private qService: QuestionService,
    private rService: ReponseService,
    private router: Router,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const titre = params.get('titre');
      if (id) this.thematiqueId = +id;
      if (titre) this.thematiqueTitre = titre!;
      this.loadSousThematiques();
    });
    this.langSub = this.i18n.language$.subscribe(() => {
      this.sousThematiques = [];
      this.questionsMap = {};
      this.responseCountMap = {};
      this.loadSousThematiques();
    });
  }

  ngAfterViewInit(): void {
    const dlg = this.analysisDialog?.nativeElement as any; 
    if (dlg && typeof dlg.showModal !== 'function') {
      dialogPolyfill.registerDialog(dlg);
    }
  }

  private loadSousThematiques(): void {
    this.isLoading = true;
    this.stService.getByThematique(this.thematiqueId).subscribe({
      next: sts => {
        this.sousThematiques = sts;
        for (const st of sts) this.loadQuestions(st.id);
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement sous-thématiques', err);
        this.isLoading = false;
      }
    });
  }

  private loadQuestions(stId: number): void {
    this.qService.getBySousThematique(stId).subscribe({
      next: qs => {
        this.questionsMap[stId] = qs;
        for (const q of qs) this.loadResponseCount(q.id);
      },
      error: err => {
        console.error(`Erreur questions ST ${stId}`, err);
        this.questionsMap[stId] = [];
      }
    });
  }

  private loadResponseCount(qId: number): void {
    this.rService.getCountByQuestion(qId).subscribe({
      next: cnt => this.responseCountMap[qId] = cnt,
      error: () => this.responseCountMap[qId] = 0
    });
  }

  private applySort(): void {
    this.rows.sort((a, b) => {
      const va = (a as any)[this.sortColumn];
      const vb = (b as any)[this.sortColumn];
      if (va === vb) return 0;
      return this.sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
  }

  sortTable(column: keyof Row): void {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
    this.applySort();
  }

  goToQuestionDetails(q: Question): void {
    this.router.navigate(['/admin/question', q.id], { queryParams: { titre: q.question } });
  }

  // ====== Ouvrir l’analyse pour une question ======
  openAnalysis(q: Question): void {
    this.analysis.questionLabel = q.question;
    this.analysis.loading = true;
    this.analysis.options = [];
    this.analysis.counts = [];

    const options$ = (q as any)?.options
      ? of((q as any).options as string[])
      : this.qService.getByIdWithOptions(q.id).pipe(map(qq => (qq?.options ?? []) as string[]));

    options$.pipe(
      switchMap(opts => {
        this.analysis.options = opts;
        return this.rService.getByQuestion(q.id).pipe(
          map(resps => {
            const base = new Map<string, number>();
            for (const o of opts) base.set(o, 0);
            let other = 0;
            for (const r of resps) {
              const v = (r.valeur || '').trim();
              if (base.has(v)) base.set(v, (base.get(v) || 0) + 1);
              else other++;
            }
            const counts = opts.map(o => base.get(o) || 0);
            this.analysis.counts  = other > 0 ? [...counts, other] : counts;
            this.analysis.options = other > 0 ? [...opts, 'Autre'] : opts;
          })
        );
      })
    ).subscribe({
      next: () => {
        this.analysis.loading = false;
        this.openDialog();   // <-- utiliser la méthode sécurisée
      },
      error: err => {
        console.error('Analyse: échec', err);
        this.analysis.loading = false;
        this.openDialog();   // <-- ouvre quand même si tu veux afficher un message
      }
    });
  }

  private openDialog(): void {
    const dlg = this.analysisDialog?.nativeElement as any; 
    if (typeof dlg.showModal === 'function') {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.show();
    }
  }

  closeAnalysis(): void {
    const dlg = this.analysisDialog?.nativeElement as any; 
    if (dlg.open) dlg.close();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }
}
