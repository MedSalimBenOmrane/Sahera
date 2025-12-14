import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Thematique } from 'src/app/models/thematique.model';
import { ThematiqueService } from 'src/app/services/thematique.service';
import { TranslationService } from 'src/app/services/translation.service';

type Meta = {
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  next: string | null;
  prev: string | null;
};
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
export class QuestionnaireComponent implements OnInit, OnDestroy {
  isLoading = false;

  thematiques: Thematique[] = [];
  private langSub?: Subscription;

  // --- pagination ---
  meta?: Meta;
  currentPage = 1;
  perPage = 4;             // adapte si tu veux (<= 100 côté back)
  get totalPages(): number { return this.meta?.pages ?? 1; }
  get pageNumbers(): number[] {
    const pages = this.totalPages;
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  constructor(
    private thematiqueService: ThematiqueService,
    private router: Router,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadPage(1);
    this.langSub = this.i18n.language$.subscribe(() => this.loadPage(this.currentPage));
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadPage(page: number): void {
    this.isLoading = true;
    this.thematiqueService
      .getPage({ page, per_page: this.perPage, sort: '-date_ouverture,name' })
      .subscribe({
        next: (res) => {
          this.thematiques = res.items;
          this.meta = res.meta as Meta;
          this.currentPage = this.meta.page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur récupération thématiques :', err);
          this.thematiques = [];
          this.meta = undefined;
          this.isLoading = false;
        }
      });
  }

  // --- helpers pagination ---
  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.loadPage(p);
  }
  firstPage(): void { this.goToPage(1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  lastPage(): void { this.goToPage(this.totalPages); }

  // utilitaire date
  private atMidnight(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  isSessionOpen(t: Thematique): boolean {
    if (!t.dateOuvertureSession || !t.dateFermetureSession) return false;
    const today = this.atMidnight(new Date());
    const start = this.atMidnight(t.dateOuvertureSession);
    const end   = this.atMidnight(t.dateFermetureSession);
    return today >= start && today <= end;
  }

  /** Méthode appelée lorsqu’on clique sur “Répondre” (éventuellement) */


}
