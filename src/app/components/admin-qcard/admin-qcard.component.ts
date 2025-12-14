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
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-admin-qcard',
  templateUrl: './admin-qcard.component.html',
  styleUrls: ['./admin-qcard.component.css']
})
export class AdminQCardComponent implements OnInit {
  @Input() id = 0;
  @Input() title = '';
  @Input() titleEn = '';
  @Input() description = '';
  @Input() descriptionEn = '';
  editDateOuverture = '';
  @Input() publicationDate: Date | null = null;
  @Input() isSessionOpen = false;
  @Input() sessionCloseDate: Date | null = null;

  @Output() deleteThematique = new EventEmitter<number>();

  @ViewChild('editDialog', { static: true })
  editDialog!: ElementRef<HTMLDialogElement>;

  editTitre = '';
  editTitreEn = '';
  editDescription = '';
  editDescriptionEn = '';
  editDateFermeture = '';

  constructor(
    private router: Router,
    private thematiqueService: ThematiqueService,
    public i18n: TranslationService
  ) {}
  ngOnInit(): void {}

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

  isOpen(): boolean {
    const start = this.asLocalDate(this.publicationDate);
    const end   = this.asLocalDate(this.sessionCloseDate);
    if (!start || !end) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    return today >= start && today <= end;
  }

  getBadgeText(): string {
    const start = this.asLocalDate(this.publicationDate);
    const end   = this.asLocalDate(this.sessionCloseDate);
    if (!start || !end) return this.i18n.translate('admin.card.closedShort');

    const today = new Date(); today.setHours(0,0,0,0);

    if (today < start) {
      const days = Math.ceil((start.getTime() - today.getTime()) / 86_400_000);
      return days > 1
        ? this.i18n.translate('admin.card.opensInDays', { days })
        : this.i18n.translate('admin.card.opensTomorrow');
    }
    if (today > end) return this.i18n.translate('admin.card.closedShort');

    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    if (daysLeft > 1)  return this.i18n.translate('admin.card.daysLeft', { days: daysLeft });
    if (daysLeft === 1) return this.i18n.translate('admin.card.oneDayLeft');
    return this.i18n.translate('admin.card.lastDay');
  }
  modify(): void {
    this.editTitre = this.title;
    this.editTitreEn = this.titleEn || '';
    this.editDescription = this.description;
    this.editDescriptionEn = this.descriptionEn || '';
    this.editDateOuverture = this.publicationDate
    ? this.publicationDate.toISOString().slice(0, 10)
    : '';
    this.editDateFermeture = this.sessionCloseDate
      ? this.sessionCloseDate.toISOString().slice(0, 10)
      : '';
    (this.editDialog.nativeElement as any).showModal();
  }

  closeEditDialog(): void {
    (this.editDialog.nativeElement as any).close();
  }

  applyEdit(): void {
  const newOpen  = this.editDateOuverture
    ? new Date(this.editDateOuverture + 'T00:00:00')
    : null;

  const newClose = this.editDateFermeture
    ? new Date(this.editDateFermeture + 'T00:00:00')
    : null;

  if (newOpen && newClose && newOpen.getTime() > newClose.getTime()) {
    alert(this.i18n.translate('admin.card.dateOrderError'));
    return;
  }

  const updated = new Thematique(
    this.id,
    this.editTitre,
    newOpen,
    newClose,
    this.editDescription,
    this.editTitre,
    this.editTitreEn || undefined,
    this.editDescription,
    this.editDescriptionEn || undefined
  );

  this.thematiqueService.update(updated).subscribe({
    next: () => {
      this.title = this.editTitre;
      this.titleEn = this.editTitreEn;
      this.description = this.editDescription;
      this.descriptionEn = this.editDescriptionEn;
      this.publicationDate = newOpen;
      this.sessionCloseDate = newClose;

      this.closeEditDialog();
    },
    error: err => console.error('Erreur update', err)
  });
}

  delete(): void {
    if (!confirm(this.i18n.translate('admin.thematiques.confirmDelete'))) return;
    this.deleteThematique.emit(this.id);
  }

  viewResponse(): void {
    this.router.navigate(['/admin/thematique', this.id, this.title]);
  }
}
