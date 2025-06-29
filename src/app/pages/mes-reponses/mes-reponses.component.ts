// src/app/pages/mes-reponses/mes-reponses.component.ts
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MesreponcesService, ThematiqueLite } from 'src/app/services/mesreponces.service';
import { ThematiqueService } from 'src/app/services/thematique.service'; // ou HttpClient direct

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
  // choix de l’onglet
  selectedTab: 'all' | 'completed' | 'incomplete' = 'all';

  // toutes les thématiques chargées de l’API
  allThematiques: ResponseCard[] = [];
  // subset selon onglet
  completedThematiques: ResponseCard[] = [];
  incompleteThematiques: ResponseCard[] = [];

  clientId!: number;

  constructor(
    private svc: MesreponcesService,
    private thematiqueSvc: ThematiqueService
  ) {}

  ngOnInit(): void {
    // on récupère l’id utilisateur en session
    const usr = JSON.parse(localStorage.getItem('user') || '{}');
    this.clientId = usr.id;

    // on veut récupérer :
    // 1) la liste complète des thématiques
    // 2) la liste des ids complétés
    // 3) la liste des ids incomplétés
    forkJoin({
      all:      this.thematiqueSvc.getAll(),
      comp:     this.svc.getCompletedThematiqueIds(this.clientId),
      incomp:   this.svc.getIncompleteThematiqueIds(this.clientId)
    }).subscribe(({ all, comp, incomp }) => {
      // transformer en ResponseCard
      this.allThematiques = all
        .map(t => ({
          id: t.id,
          title: t.titre,
          description: t.description,
          publicationDate: new Date(t.dateCreation!),
          sessionCloseDate: new Date(t.dateFermetureSession!),
          isSessionOpen: !t.dateFermetureSession || new Date(t.dateFermetureSession) > new Date(),
          isAnswered:    comp.some(x=> x.id === t.id),
          responseDate:  undefined // éventuellement à compléter
        }))
        // tri plus récent publication en premier
        .sort((a,b)=> b.publicationDate.getTime() - a.publicationDate.getTime());

      // sous-listes
      this.completedThematiques = this.allThematiques.filter(r=> r.isAnswered);
      this.incompleteThematiques = this.allThematiques.filter(r=> !r.isAnswered);
    });
  }

  // appelé par le template pour switcher
  selectTab(tab: 'all'|'completed'|'incomplete') {
    this.selectedTab = tab;
  }

  // exposer la liste à afficher
  get displayedThematiques(): ResponseCard[] {
    switch (this.selectedTab) {
      case 'completed':   return this.completedThematiques;
      case 'incomplete':  return this.incompleteThematiques;
      default:            return this.allThematiques;
    }
  }
}
