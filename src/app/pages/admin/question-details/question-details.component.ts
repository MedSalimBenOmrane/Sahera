import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { ClientsService } from 'src/app/services/clients.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { TranslationService } from 'src/app/services/translation.service';

interface Row {
  userId: number;
  nom: string;
  prenom: string;
  valeur: string;
}

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit, OnDestroy {
  questionId!: number;
  questionTitre!: string;
  isLoading = false;
  rows: Row[] = [];
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private reponseService: ReponseService,
    private clientsService: ClientsService,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.questionId = +params.get('id')!;
      this.questionTitre = this.route.snapshot.queryParamMap.get('titre') || '';
      this.loadResponses();
      this.resetScroll();
    });
    this.langSub = this.i18n.language$.subscribe(() => this.loadResponses());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadResponses(): void {
    this.isLoading = true;

    this.reponseService.getByQuestion(this.questionId).subscribe(
      reps => {
        if (reps.length === 0) {
          this.rows = [];
          this.isLoading = false;
          this.resetScroll();
          return;
        }
        const calls = reps.map(rep => this.clientsService.getClientById(rep.userId));
        forkJoin(calls).subscribe(
          clients => {
            this.rows = reps.map((rep, i) => {
              const c = clients[i];
              const valeur = Array.isArray(rep.valeur) ? rep.valeur.join(' / ') : rep.valeur;
              return {
                userId: c?.id ?? rep.userId,
                nom: c?.nom ?? '',
                prenom: c?.prenom ?? '',
                valeur: valeur
              };
            });
            this.isLoading = false;
            this.resetScroll();
          },
          err => {
            console.error(err);
            this.rows = [];
            this.isLoading = false;
            this.resetScroll();
          }
        );
      },
      err => {
        console.error(err);
        this.rows = [];
        this.isLoading = false;
        this.resetScroll();
      }
    );
  }

  private resetScroll(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    ['.table__body', 'main.table', '.glass-container'].forEach(sel => {
      document.querySelectorAll<HTMLElement>(sel).forEach(el => (el.scrollTop = 0));
    });
  }

  downloadCsv(): void {
    if (this.isLoading || this.rows.length === 0) return;

    const headers = [
      this.i18n.translate('admin.questionDetails.userId'),
      this.i18n.translate('admin.questionDetails.name'),
      this.i18n.translate('admin.questionDetails.firstname'),
      this.i18n.translate('admin.questionDetails.answer')
    ];

    const lines = [
      headers,
      ...this.rows.map(row => [
        String(row.userId ?? ''),
        row.nom ?? '',
        row.prenom ?? '',
        row.valeur ?? ''
      ])
    ].map(cols => cols.map(this.escapeCsv).join(','));

    const csvContent = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = this.buildCsvFilename();
    link.click();

    URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    const normalized = String(value ?? '');
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private buildCsvFilename(): string {
    const rawTitle = this.questionTitre || 'question';
    const withoutDiacritics = rawTitle
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');
    const safeTitle = withoutDiacritics
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    const base = safeTitle ? `question-${this.questionId}-${safeTitle}` : `question-${this.questionId}`;
    return `${base}.csv`;
  }
}
