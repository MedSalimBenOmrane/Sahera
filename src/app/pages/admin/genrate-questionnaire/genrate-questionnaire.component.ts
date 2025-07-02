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
  isLoading      = false; // loader pour la liste des thématiques
  isCsvLoading   = false; // loader pour import CSV
  isSousLoading  = false; // loader pour sous-thématiques
  selectedFile: File | null = null;

  newThematique: {
    titre: string;
    description: string;
    dateFermetureSession: string;
  } = {
    titre: '',
    description: '',
    dateFermetureSession: ''
  };

  @ViewChild('dialog', { static: true })
  dialogRef!: ElementRef;  // on peut laisser ElementRef sans générique
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
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: data  => this.thematiques = data,
        error: err  => {
          console.error('Erreur chargement thématiques', err);
          // eventuellement afficher un message d'erreur ici
        }
      });
  }

  isSessionOpen(t: Thematique): boolean {
    return new Date() < new Date(t.dateFermetureSession);
  }

  openCreateDialog(): void {
    this.newThematique = { titre: '', description: '', dateFermetureSession: '' };
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
    const { titre, description, dateFermetureSession } = this.newThematique;
    if (!titre || !description || !dateFermetureSession) { return; }

    const thematique = new Thematique(
      0,
      titre,
      new Date(),
      new Date(dateFermetureSession),
      description
    );

    this.isLoading = true;
    this.thematiqueService.create(thematique)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: created => {
          this.currentCreatedThematiqueId = created.id;
          // si un CSV a été choisi => on l’importe
          if (this.selectedFile) {
            this.importCsv(created.id);
          } else {
            this.closeDialog();
            this.loadThematiques();
          }
        },
        error: err => console.error('Erreur création thématique', err)
      });
  }

  private importCsv(thematiqueId: number): void {
    const fd = new FormData();
    fd.append('file', this.selectedFile!);

    this.isCsvLoading = true;
    this.thematiqueService.importCsv(thematiqueId, fd)
      .pipe(finalize(() => this.isCsvLoading = false))
      .subscribe({
        next: res => {
          console.log('Import CSV OK', res);
          this.closeDialog();
          this.loadThematiques();
        },
        error: err => {
          console.error('Erreur import CSV', err);
          // tu peux afficher un toast / message d’erreur ici
        }
      });
  }
 onDeleteThematique(id: number): void {
  this.thematiqueService.delete(id).subscribe({
    next: () => this.loadThematiques(),
    error: err => console.error(err)
  });
}
}
