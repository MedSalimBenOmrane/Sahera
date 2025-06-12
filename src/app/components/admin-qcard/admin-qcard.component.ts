import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Thematique } from 'src/app/models/thematique.model';
import { ThematiqueService } from 'src/app/services/thematique.service';

@Component({
  selector: 'app-admin-qcard',
  templateUrl: './admin-qcard.component.html',
  styleUrls: ['./admin-qcard.component.css']
})
export class AdminQCardComponent implements OnInit {
@Input() id = 0;
  @Input() title = '';
  @Input() description = '';
  @Input() publicationDate!: Date;
  @Input() isSessionOpen = false;
  @Input() sessionCloseDate!: Date;
  @Output() deleteThematique = new EventEmitter<number>();

 

  @ViewChild('editDialog', { static: true })
  editDialog!: ElementRef<HTMLDialogElement>;

  // champs du formulaire d’édition
  editTitre = '';
  editDescription = '';
  editDateFermeture = ''; // format "YYYY-MM-DD"


  constructor(private router: Router,
    private thematiqueService: ThematiqueService
  ) {}

  ngOnInit(): void {}

  getTimeRemaining(sessionCloseDate: string | Date): string {
    const now = new Date();
    const end = new Date(sessionCloseDate);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Fermé';
    }

    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr  = Math.floor(min / 60);
    const days = Math.floor(hr / 24);

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
    }
    if (hr > 0) {
      return `${hr} heure${hr > 1 ? 's' : ''} restante${hr > 1 ? 's' : ''}`;
    }
    if (min > 0) {
      return `${min} minute${min > 1 ? 's' : ''} restante${min > 1 ? 's' : ''}`;
    }
    // moins d'une minute
    return `${sec} seconde${sec > 1 ? 's' : ''} restante${sec > 1 ? 's' : ''}`;
  }
  modify(): void {
    this.editTitre = this.title;
    this.editDescription = this.description;
    this.editDateFermeture = this.sessionCloseDate
      .toISOString()
      .slice(0, 10);
    (this.editDialog.nativeElement as any).showModal();
  }

  closeEditDialog(): void {
    (this.editDialog.nativeElement as any).close();
  }

  /** Applique la modification via le service */
  applyEdit(): void {
    const updated = new Thematique(
      this.id,
      this.editTitre,
      this.publicationDate,
      new Date(this.editDateFermeture),
      this.editDescription
    );

    this.thematiqueService.update(updated).subscribe({
      next: () => {
        // on met à jour l’affichage local sans recharger la page
        this.title = this.editTitre;
        this.description = this.editDescription;
        this.sessionCloseDate = new Date(this.editDateFermeture);
        this.closeEditDialog();
      },
      error: err => console.error('Erreur update', err)
    });
  }

  /** Supprime et notifie le parent */
  delete(): void {
    if (!confirm('Voulez-vous vraiment supprimer cette thématique ?')) {
      return;
    }
    // on émet l’ID au parent, c’est lui qui fera appel au service
    this.deleteThematique.emit(this.id);
  }


  viewResponse(): void {
    this.router.navigate(['/admin/thematique', this.id, this.title]);
  }
}



