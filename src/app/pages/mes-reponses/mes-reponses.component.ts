import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MesreponcesService, ThematiqueLite } from 'src/app/services/mesreponces.service';
import { ThematiqueService } from 'src/app/services/thematique.service';

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

@Component({
  selector: 'app-mes-reponses',
  templateUrl: './mes-reponses.component.html',
  styleUrls: ['./mes-reponses.component.css']
})
export class MesReponsesComponent implements OnInit {
  selectedTab: 'all' | 'completed' | 'incomplete' = 'all';

  allThematiques: ResponseCard[] = [];
  completedThematiques: ResponseCard[] = [];
  incompleteThematiques: ResponseCard[] = [];

  clientId!: number;

  // ← flag de chargement
  isLoading = false;

  constructor(
    private svc: MesreponcesService,
    private thematiqueSvc: ThematiqueService
  ) {}

  ngOnInit(): void {
    const usr = JSON.parse(localStorage.getItem('user') || '{}');
    this.clientId = usr.id;

    this.loadThematiques();
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
            publicationDate: new Date(t.dateCreation!),
            sessionCloseDate: new Date(t.dateFermetureSession!),
            isSessionOpen: !t.dateFermetureSession || new Date(t.dateFermetureSession) > new Date(),
            isAnswered: comp.some(x => x.id === t.id),
            responseDate: undefined
          }))
          .sort((a,b) => b.publicationDate.getTime() - a.publicationDate.getTime());

        this.completedThematiques  = this.allThematiques.filter(r => r.isAnswered);
        this.incompleteThematiques = this.allThematiques.filter(r => !r.isAnswered);

        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement thématiques', err);
        this.allThematiques = this.completedThematiques = this.incompleteThematiques = [];
        this.isLoading = false;
      }
    });
  }

  selectTab(tab: 'all'|'completed'|'incomplete') {
    this.selectedTab = tab;
  }

  get displayedThematiques(): ResponseCard[] {
    switch (this.selectedTab) {
      case 'completed':  return this.completedThematiques;
      case 'incomplete': return this.incompleteThematiques;
      default:           return this.allThematiques;
    }
  }
}
