import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';
import { TranslationService } from 'src/app/services/translation.service';
interface FormField {
  key: keyof ClientForm;
  labelKey: string;
  type: 'text'|'email'|'password'|'date'|'select';
  options?: Array<{ value: string; labelKey: string }>;
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
    { key: 'nom',            labelKey: 'auth.signup.name',        type: 'text' },
    { key: 'prenom',         labelKey: 'auth.signup.firstName',   type: 'text' },
    { key: 'email',          labelKey: 'auth.signup.email',       type: 'email' },
    { key: 'mot_de_passe',   labelKey: 'auth.signup.password',    type: 'password' },
    { key: 'telephone',      labelKey: 'auth.signup.phone',       type: 'text' },
    { key: 'date_naissance', labelKey: 'auth.signup.birthDate',   type: 'date' },
    { key: 'genre',          labelKey: 'auth.signup.genderLabel', type: 'select' },
    { key: 'ethnicite',      labelKey: 'auth.signup.ethnicity',   type: 'select' },
    { key: 'role',           labelKey: 'admin.table.role',        type: 'text' }
  ];

  constructor(
    private svc: ClientsService,
    private router: Router,
    public i18n: TranslationService
  ) {
    this.formFields = this.formFields.map(field => {
      if (field.key === 'genre') {
        return { ...field, options: this.i18n.getOptions('gender') };
      }
      if (field.key === 'ethnicite') {
        return { ...field, options: this.i18n.getOptions('ethnicity') };
      }
      return field;
    });
  }

  ngOnInit(): void {
    const id = localStorage.getItem('userId');
    if (!id) {
      this.errorMsg = 'navbar.error.loadProfile';
      return;
    }
    this.userId = +id;
    this.loadUser();
    (this.dialogRef.nativeElement as any).showModal();
  }

  private loadUser(): void {
    this.isLoading = true;
    this.errorMsg = null;

    this.svc.getClientById(this.userId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: user => this.fillForm(user),
      error: () => this.errorMsg = 'navbar.error.loadProfile'
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
      error: () => this.errorMsg = 'navbar.error.updateProfile'
    });
  }

  closeDialog() {
    (this.dialogRef.nativeElement as any).close();
    this.router.navigate(['/']);
  }
}
