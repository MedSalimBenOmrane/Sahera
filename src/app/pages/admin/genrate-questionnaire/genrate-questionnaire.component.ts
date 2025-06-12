import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Thematique } from 'src/app/models/thematique.model';
import { ThematiqueService } from 'src/app/services/thematique.service';

@Component({
  selector: 'app-genrate-questionnaire',
  templateUrl: './genrate-questionnaire.component.html',
  styleUrls: ['./genrate-questionnaire.component.css']
})
export class GenrateQuestionnaireComponent implements OnInit {
  thematiques: Thematique[] = [];

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

  constructor(private thematiqueService: ThematiqueService) {}

  ngOnInit(): void {
    this.loadThematiques();
  }

  private loadThematiques(): void {
    this.thematiqueService.getAll().subscribe({
      next: data => this.thematiques = data,
      error: err => console.error('Erreur chargement thématiques', err)
    });
  }

  isSessionOpen(t: Thematique): boolean {
    return new Date() < new Date(t.dateFermetureSession);
  }

  openCreateDialog(): void {
    this.newThematique = { titre: '', description: '', dateFermetureSession: '' };
    // cast en any pour accéder à showModal()
    (this.dialogRef.nativeElement as any).showModal();
  }

  closeDialog(): void {
    // cast en any pour accéder à close()
    (this.dialogRef.nativeElement as any).close();
  }

  createThematique(): void {
    const { titre, description, dateFermetureSession } = this.newThematique;
    if (!titre || !description || !dateFermetureSession) {
      return;
    }

    const fermeture = new Date(dateFermetureSession);
    const thematique = new Thematique(
      0,
      titre,
      new Date(),
      fermeture,
      description
    );

    this.thematiqueService.create(thematique).subscribe({
      next: () => {
        this.loadThematiques();
        this.closeDialog();
      },
      error: err => console.error('Erreur création thématique', err)
    });
  }
 onDeleteThematique(id: number): void {
  this.thematiqueService.delete(id).subscribe({
    next: () => this.loadThematiques(),
    error: err => console.error(err)
  });
}
}
