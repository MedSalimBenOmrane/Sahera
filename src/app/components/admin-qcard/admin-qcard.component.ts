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
  editDateOuverture = ''; // "YYYY-MM-DD"
  // ← accepter null
  @Input() publicationDate: Date | null = null;
  @Input() isSessionOpen = false;
  @Input() sessionCloseDate: Date | null = null;

  @Output() deleteThematique = new EventEmitter<number>();

  @ViewChild('editDialog', { static: true })
  editDialog!: ElementRef<HTMLDialogElement>;

  // champs du formulaire d’édition
  editTitre = '';
  editDescription = '';
  editDateFermeture = ''; // "YYYY-MM-DD"

  constructor(
    private router: Router,
    private thematiqueService: ThematiqueService
  ) {}
  ngOnInit(): void {
    
  }

  /** 'YYYY-MM-DD' | Date -> Date locale à 00:00, sinon null */
  private asLocalDate(d: string | Date | null | undefined): Date | null {
    if (!d) return null;
    if (d instanceof Date) {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    }
    const [y, m, dd] = d.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, dd ?? 1, 0, 0, 0, 0);
  }

  /** Ouvert ssi aujourd’hui ∈ [ouverture, clôture] (inclusif) */
  isOpen(): boolean {
    const start = this.asLocalDate(this.publicationDate);
    const end   = this.asLocalDate(this.sessionCloseDate);
    if (!start || !end) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    return today >= start && today <= end;
  }

  /** Texte secondaire : “Ouvre dans X jours”, “N jours restants” ou “Fermé” */
  getBadgeText(): string {
    const start = this.asLocalDate(this.publicationDate);
    const end   = this.asLocalDate(this.sessionCloseDate);
    if (!start || !end) return 'Fermé';

    const today = new Date(); today.setHours(0,0,0,0);

    if (today < start) {
      const days = Math.ceil((start.getTime() - today.getTime()) / 86_400_000);
      return days > 1 ? `Ouvre dans ${days} jours` : `Ouvre demain`;
    }
    if (today > end) return 'Fermé';

    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    if (daysLeft > 1)  return `${daysLeft} jours restants`;
    if (daysLeft === 1) return `1 jour restant`;
    return `Dernier jour`;
  }
  modify(): void {
    this.editTitre = this.title;
    this.editDescription = this.description;
      this.editDateOuverture = this.publicationDate
    ? this.publicationDate.toISOString().slice(0, 10)
    : '';
    this.editDateFermeture = this.sessionCloseDate
      ? this.sessionCloseDate.toISOString().slice(0, 10)
      : ''; // ← si null
    (this.editDialog.nativeElement as any).showModal();
  }

  closeEditDialog(): void {
    (this.editDialog.nativeElement as any).close();
  }

  /** Applique la modification via le service */
  applyEdit(): void {
  const newOpen  = this.editDateOuverture
    ? new Date(this.editDateOuverture + 'T00:00:00')
    : null;

  const newClose = this.editDateFermeture
    ? new Date(this.editDateFermeture + 'T00:00:00')
    : null;

  // Validation simple : si les deux existent, ouverture <= clôture
  if (newOpen && newClose && newOpen.getTime() > newClose.getTime()) {
    alert("La date d’ouverture doit être antérieure ou égale à la date de clôture.");
    return;
  }

  const updated = new Thematique(
    this.id,
    this.editTitre,
    newOpen,     // ← NOUVEAU : on envoie la date d’ouverture choisie
    newClose,
    this.editDescription
  );

  this.thematiqueService.update(updated).subscribe({
    next: () => {
      // Met à jour l’affichage local
      this.title = this.editTitre;
      this.description = this.editDescription;
      this.publicationDate = newOpen;
      this.sessionCloseDate = newClose;

      this.closeEditDialog();
    },
    error: err => console.error('Erreur update', err)
  });
}

  /** Supprime et notifie le parent */
  delete(): void {
    if (!confirm('Voulez-vous vraiment supprimer cette thématique ?')) return;
    this.deleteThematique.emit(this.id);
  }

  viewResponse(): void {
    this.router.navigate(['/admin/thematique', this.id, this.title]);
  }
}
