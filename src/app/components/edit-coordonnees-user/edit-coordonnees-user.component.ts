import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';
interface FormField {
  key: keyof ClientForm;
  label: string;
  type: 'text'|'email'|'password'|'date'|'select';
  options?: string[];
}
type ClientForm = Omit<Client,'date_naissance'> & { date_naissance?: string; };
@Component({
  selector: 'app-edit-coordonnees-user',
  templateUrl: './edit-coordonnees-user.component.html',
  styleUrls: ['./edit-coordonnees-user.component.css']
})

export class EditCoordonneesUserComponent implements OnInit {
 @ViewChild('dialog', { static: true })
  dialogRef!: ElementRef<HTMLDialogElement>;

  form: Partial<ClientForm> = {};
  isLoading = false;
  errorMsg: string | null = null;
  private userId!: number;

  formFields: FormField[] = [
    { key: 'nom',            label: 'Nom',           type: 'text' },
    { key: 'prenom',         label: 'Prénom',        type: 'text' },
    { key: 'email',          label: 'Email',         type: 'email' },
    { key: 'mot_de_passe',   label: 'Mot de passe',  type: 'password' },
    { key: 'telephone',      label: 'Téléphone',     type: 'text' },
    { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
    { key: 'genre',          label: 'Genre',         type: 'select', options: ['Homme','Femme'] },
    { key: 'ethnicite',      label: 'Ethnicité',     type: 'select', options: [
      'Amérindien ou Autochtone d’Alaska','Asiatique','Noir ou Afro-Américain',
      'Hispanique ou Latino','Moyen-Oriental ou Nord-Africain',
      'Océanien (Hawaïen ou des îles du Pacifique)','Blanc ou Européen Américain'
    ]},
    { key: 'role',           label: 'Rôle',          type: 'text' }
  ];

  constructor(
    private svc: ClientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('userId');
    if (!id) {
      this.errorMsg = 'Utilisateur non authentifié.';
      return;
    }
    this.userId = +id;
    this.loadUser();
    // on ouvre immédiatement le dialog
    (this.dialogRef.nativeElement as any).showModal();
  }

  private loadUser(): void {
    this.isLoading = true;
    this.errorMsg = null;

    this.svc.getClientById(this.userId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: user => this.fillForm(user),
      error: () => this.errorMsg = 'Impossible de charger vos données.'
    });
  }

  private fillForm(u: Client) {
    this.form = {
      nom:            u.nom,
      prenom:         u.prenom,
      email:          u.email,
      mot_de_passe:   '',
      telephone:      u.telephone,
      genre:          u.genre,
      ethnicite:      u.ethnicite,
      role:           u.role,
      date_naissance: u.date_naissance
        ? new Date(u.date_naissance).toISOString().slice(0,10)
        : ''
    };
  }

  saveProfile() {
    const dateObj = new Date(this.form.date_naissance as string);
    const payload = new Client(
      this.userId,
      this.form.nom          || '',
      this.form.prenom       || '',
      this.form.email        || '',
      this.form.mot_de_passe || '',
      this.form.telephone    || '',
      dateObj,
      this.form.genre        || '',
      this.form.role         || '',
      this.form.ethnicite    || ''
    );

    this.svc.updateClient(payload).subscribe({
      next: () => this.closeDialog(),
      error: () => this.errorMsg = 'Erreur lors de la mise à jour.'
    });
  }

  closeDialog() {
    (this.dialogRef.nativeElement as any).close();
    // on retourne à l'accueil
    this.router.navigate(['/']);
  }
}
