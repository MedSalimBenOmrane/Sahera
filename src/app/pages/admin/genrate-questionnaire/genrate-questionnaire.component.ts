import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { finalize } from 'rxjs';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { Thematique } from 'src/app/models/thematique.model';
import { ThematiqueService } from 'src/app/services/thematique.service';

@Component({
  selector: 'app-genrate-questionnaire',
  templateUrl: './genrate-questionnaire.component.html',
  styleUrls: ['./genrate-questionnaire.component.css']
})
export class GenrateQuestionnaireComponent implements OnInit {
  thematiques: Thematique[] = [];
  selectedSous: SousThematique[] = [];

  isLoading = false;     // loader pour la liste des thématiques
  isCsvLoading = false;  // loader pour import CSV
  isSousLoading = false; // loader pour sous-thématiques
  selectedFile: File | null = null;

  // Champs du formulaire de création (format YYYY-MM-DD)
  newThematique: {
    titre: string;
    description: string;
    dateOuvertureSession: string;   // ex: "2025-08-03"
    dateFermetureSession: string;   // ex: "2025-08-20"
  } = {
    titre: '',
    description: '',
    dateOuvertureSession: '',
    dateFermetureSession: ''
  };

  @ViewChild('dialog', { static: true })
  dialogRef!: ElementRef; // <dialog>

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  currentCreatedThematiqueId?: number;

  constructor(private thematiqueService: ThematiqueService) {}

  ngOnInit(): void {
    this.loadThematiques();
  }

  private loadThematiques(): void {
    this.isLoading = true;
    this.thematiqueService.getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => (this.thematiques = data),
        error: (err) => {
          console.error('Erreur chargement thématiques', err);
          this.thematiques = [];
        }
      });
  }

  // Normalise une date à minuit local (pour éviter les surprises de fuseau)
  private atMidnight(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  asLocalDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null;
  if (d instanceof Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  // '2025-08-03' -> (year=2025, month=7, day=3)
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, dd ?? 1, 0, 0, 0, 0);
}
  /**
   * Session ouverte ssi today ∈ [ouverture, clôture] (bornes incluses).
   * Si l’une des dates manque -> fermé.
   */
  isSessionOpen(t: Thematique): boolean {
  const start = this.asLocalDate(t.dateOuvertureSession as any);
  const end   = this.asLocalDate(t.dateFermetureSession as any);
  if (!start || !end) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today >= start && today <= end;
}
  openCreateDialog(): void {
    this.newThematique = {
      titre: '',
      description: '',
      dateOuvertureSession: '',
      dateFermetureSession: ''
    };
    this.selectedFile = null;
    (this.dialogRef.nativeElement as any).showModal();
  }

  closeDialog(): void {
    (this.dialogRef.nativeElement as any).close();
  }

  onFileSelected(event: Event): void {
    const inp = event.target as HTMLInputElement;
    if (inp.files && inp.files.length) {
      this.selectedFile = inp.files[0];
    }
  }

  createThematique(): void {
    const {
      titre,
      description,
      dateOuvertureSession,
      dateFermetureSession
    } = this.newThematique;

    // validations
    if (!titre || !description || !dateOuvertureSession || !dateFermetureSession) {
      console.error('Champs requis manquants');
      return;
    }

    // Construit des dates à minuit local
    const ouverture = new Date(dateOuvertureSession + 'T00:00:00');
    const cloture   = new Date(dateFermetureSession + 'T00:00:00');

    if (isNaN(ouverture.getTime()) || isNaN(cloture.getTime())) {
      console.error('Dates invalides');
      return;
    }
    if (ouverture.getTime() > cloture.getTime()) {
      console.error('La date d’ouverture doit être ≤ la date de clôture');
      return;
    }

    const thematique = new Thematique(
      0,
      titre,
      ouverture,   // on respecte la saisie de l’admin
      cloture,
      description
    );

    this.isLoading = true;
    this.thematiqueService.create(thematique)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created) => {
          this.currentCreatedThematiqueId = created.id;

          if (this.selectedFile) {
            this.importCsv(created.id);
          } else {
            this.closeDialog();
            this.loadThematiques();
          }
        },
        error: (err) => console.error('Erreur création thématique', err)
      });
  }

  private importCsv(thematiqueId: number): void {
    if (!this.selectedFile) {
      this.closeDialog();
      this.loadThematiques();
      return;
    }

    const fd = new FormData();
    fd.append('file', this.selectedFile);

    this.isCsvLoading = true;
    this.thematiqueService.importCsv(thematiqueId, fd)
      .pipe(finalize(() => (this.isCsvLoading = false)))
      .subscribe({
        next: () => {
          this.closeDialog();
          this.loadThematiques();
        },
        error: (err) => console.error('Erreur import CSV', err)
      });
  }

  onDeleteThematique(id: number): void {
    this.thematiqueService.delete(id).subscribe({
      next: () => this.loadThematiques(),
      error: (err) => console.error(err)
    });
  }
}
