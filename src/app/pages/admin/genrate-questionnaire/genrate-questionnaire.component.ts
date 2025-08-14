// genrate-questionnaire.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { finalize } from 'rxjs';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { Thematique } from 'src/app/models/thematique.model';
import { ThematiqueService } from 'src/app/services/thematique.service';

type Meta = {
  total: number; page: number; per_page: number; pages: number;
  has_next: boolean; has_prev: boolean; next: string | null; prev: string | null;
};

@Component({
  selector: 'app-genrate-questionnaire',
  templateUrl: './genrate-questionnaire.component.html',
  styleUrls: ['./genrate-questionnaire.component.css']
})
export class GenrateQuestionnaireComponent implements OnInit {
  thematiques: Thematique[] = [];

  isLoading = false;
  isCsvLoading = false;
  selectedFile: File | null = null;

  newThematique = {
    titre: '',
    description: '',
    dateOuvertureSession: '',
    dateFermetureSession: ''
  };

  @ViewChild('dialog', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  // --- pagination ---
  meta?: Meta;
  currentPage = 1;
  perPage = 4;  // 4 éléments par page
  get totalPages(): number { return this.meta?.pages ?? 1; }
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }

  constructor(private thematiqueService: ThematiqueService) {}

  ngOnInit(): void { this.loadPage(1); }

  // charge une page
  private loadPage(page: number): void {
    this.isLoading = true;
    this.thematiqueService
      .getPage({ page, per_page: this.perPage, sort: '-date_ouverture,name' })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ items, meta }) => {
          this.thematiques = items;
          this.meta = meta as Meta;
          this.currentPage = this.meta.page;
        },
        error: err => {
          console.error('Erreur chargement thématiques', err);
          this.thematiques = [];
          this.meta = undefined;
        }
      });
  }

  // handlers pagination
  goToPage(p:number){ if(p<1 || p>this.totalPages || p===this.currentPage) return; this.loadPage(p); }
  firstPage(){ this.goToPage(1); }
  prevPage(){ this.goToPage(this.currentPage - 1); }
  nextPage(){ this.goToPage(this.currentPage + 1); }
  lastPage(){ this.goToPage(this.totalPages); }

  // --- Dialog CRUD (inchangé à 99%), mais on RELIT la page après action
  openCreateDialog(): void {
    this.newThematique = { titre:'', description:'', dateOuvertureSession:'', dateFermetureSession:'' };
    this.selectedFile = null;
    (this.dialogRef.nativeElement as any).showModal();
  }
  closeDialog(): void { (this.dialogRef.nativeElement as any).close(); }

  onFileSelected(ev: Event): void {
    const inp = ev.target as HTMLInputElement;
    if (inp.files && inp.files.length) this.selectedFile = inp.files[0];
  }

  createThematique(): void {
    const { titre, description, dateOuvertureSession, dateFermetureSession } = this.newThematique;
    if (!titre || !description || !dateOuvertureSession || !dateFermetureSession) return;

    const ouverture = new Date(dateOuvertureSession + 'T00:00:00');
    const cloture   = new Date(dateFermetureSession + 'T00:00:00');
    if (isNaN(ouverture.getTime()) || isNaN(cloture.getTime()) || ouverture > cloture) return;

    const t = new Thematique(0, titre, ouverture, cloture, description);

    this.isLoading = true;
    this.thematiqueService.create(t)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created) => {
          if (this.selectedFile) {
            this.importCsv(created.id);         // après import on rechargera la liste
          } else {
            this.closeDialog();
            this.loadPage(1);                   // reviens sur la 1ère page (tri -date_ouverture)
          }
        },
        error: err => console.error('Erreur création thématique', err)
      });
  }

  private importCsv(thematiqueId: number): void {
    if (!this.selectedFile) { this.closeDialog(); this.loadPage(1); return; }
    const fd = new FormData(); fd.append('file', this.selectedFile);

    this.isCsvLoading = true;
    this.thematiqueService.importCsv(thematiqueId, fd)
      .pipe(finalize(() => (this.isCsvLoading = false)))
      .subscribe({
        next: () => { this.closeDialog(); this.loadPage(1); },
        error: err => console.error('Erreur import CSV', err)
      });
  }

  onDeleteThematique(id: number): void {
    this.thematiqueService.delete(id).subscribe({
      next: () => {
        // si on supprime le dernier item de la page, recule d'une page
        const isLastOnPage = this.thematiques.length === 1 && this.currentPage > 1;
        this.loadPage(isLastOnPage ? this.currentPage - 1 : this.currentPage);
      },
      error: err => console.error(err)
    });
  }

  // util divers (inchangés)
  isSessionOpen(t: Thematique): boolean {
    const start = t.dateOuvertureSession ? new Date(t.dateOuvertureSession) : null;
    const end   = t.dateFermetureSession ? new Date(t.dateFermetureSession) : null;
    if (!start || !end) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    start.setHours(0,0,0,0); end.setHours(0,0,0,0);
    return today >= start && today <= end;
  }
}
