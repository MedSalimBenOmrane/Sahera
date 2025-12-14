import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { MesreponcesService, ThematiqueLite } from 'src/app/services/mesreponces.service';
import { ThematiqueService } from 'src/app/services/thematique.service';
import { TranslationService } from 'src/app/services/translation.service';

interface ResponseCard {
  id: number;
  title: string;
  description: string;
  publicationDate: Date;
  isSessionOpen: boolean;
  sessionCloseDate: Date;
  isAnswered: boolean;
  responseDate?: string;
}

// ...imports inchangés

@Component({
  selector: 'app-mes-reponses',
  templateUrl: './mes-reponses.component.html',
  styleUrls: ['./mes-reponses.component.css']
})
export class MesReponsesComponent implements OnInit, OnDestroy {
  selectedTab: 'all' | 'completed' | 'incomplete' = 'all';

  allThematiques: ResponseCard[] = [];
  completedThematiques: ResponseCard[] = [];
  incompleteThematiques: ResponseCard[] = [];

  clientId!: number;
  isLoading = false;
  private langSub?: Subscription;

  // 🔹 pagination client
  perPage = 4;
  currentPage = 1;

  constructor(
    private svc: MesreponcesService,
    private thematiqueSvc: ThematiqueService,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    const usr = JSON.parse(localStorage.getItem('user') || '{}');
    this.clientId = usr.id;
    this.loadThematiques();
    this.langSub = this.i18n.language$.subscribe(() => this.loadThematiques());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadThematiques(): void {
    this.isLoading = true;

    forkJoin({
      all:    this.thematiqueSvc.getAll(),
      comp:   this.svc.getCompletedThematiqueIds(this.clientId),
      incomp: this.svc.getIncompleteThematiqueIds(this.clientId)
    }).subscribe({
      next: ({ all, comp, incomp }) => {
        this.allThematiques = all
          .map(t => ({
            id: t.id,
            title: t.titre,
            description: t.description,
            publicationDate: t.dateOuvertureSession ? new Date(t.dateOuvertureSession) : new Date(),
            sessionCloseDate: t.dateFermetureSession ? new Date(t.dateFermetureSession) : new Date(),
            isSessionOpen: !!(t.dateFermetureSession && new Date(t.dateFermetureSession) > new Date()),
            isAnswered: comp.some(x => x.id === t.id),
            responseDate: undefined
          }))
          .sort((a,b) => b.publicationDate.getTime() - a.publicationDate.getTime());

        this.completedThematiques  = this.allThematiques.filter(r => r.isAnswered);
        this.incompleteThematiques = this.allThematiques.filter(r => !r.isAnswered);

        // remet la pagination au début
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement thématiques', err);
        this.allThematiques = this.completedThematiques = this.incompleteThematiques = [];
        this.isLoading = false;
      }
    });
  }

  // 🔹 liste active selon l’onglet
  get activeList(): ResponseCard[] {
    switch (this.selectedTab) {
      case 'completed':  return this.completedThematiques;
      case 'incomplete': return this.incompleteThematiques;
      default:           return this.allThematiques;
    }
  }

  // 🔹 helpers pagination
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.activeList.length / this.perPage));
  }
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  get pageItems(): ResponseCard[] {
    const start = (this.currentPage - 1) * this.perPage;
    return this.activeList.slice(start, start + this.perPage);
  }

  goToPage(p:number){ if(p<1 || p>this.totalPages || p===this.currentPage) return; this.currentPage = p; }
  firstPage(){ this.goToPage(1); }
  prevPage(){ this.goToPage(this.currentPage - 1); }
  nextPage(){ this.goToPage(this.currentPage + 1); }
  lastPage(){ this.goToPage(this.totalPages); }

  // 🔹 quand on change d’onglet, on repart page 1
  selectTab(tab: 'all'|'completed'|'incomplete') {
    this.selectedTab = tab;
    this.currentPage = 1;
  }
}
