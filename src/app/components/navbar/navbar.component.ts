import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';
import { NotificationService } from 'src/app/services/notification.service';
import dialogPolyfill from 'dialog-polyfill';
import { AuthService } from 'src/app/services/auth.service';
import { Lang, TranslationService } from 'src/app/services/translation.service';

interface FormField {
  key: keyof ClientForm;
  labelKey: string;
  type: 'text' | 'email' | 'password' | 'date' | 'select';
  options?: Array<{ value: string; labelKey: string }>;
}
type ClientForm = Omit<Client, 'date_naissance'> & { date_naissance?: string };

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit  {

  @ViewChild('profileDialog', { static: true })
  profileDialog!: ElementRef<HTMLDialogElement>;

  form: Partial<ClientForm> = {};
  isLoading = false;
  errorMsgKey: string | null = null;
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
    private notificationService: NotificationService,
    private authservice: AuthService,
    private svc: ClientsService,
    public i18n: TranslationService
  ) {
    this.populateSelectOptions();
  }

  unreadTotal$ = this.notificationService.unreadTotal$;

  ngAfterViewInit(): void {
    dialogPolyfill.registerDialog(this.profileDialog.nativeElement);
  }

  ngOnInit(): void {
    this.notificationService.getNotificationsForCurrentUser().subscribe({
      error: err => console.error('Notif failed', err)
    });
    this.notificationService.refreshUnreadTotal();
  }

  /** Ouvre le dialog et pré-remplit le form */
  openProfileDialog(): void {
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!raw) {
      console.error('Pas d’utilisateur en session');
      return;
    }
    const obj = JSON.parse(raw) as { id: number };
    this.userId = obj.id;
    this.loadUser();
    (this.profileDialog.nativeElement as any).showModal();
  }

  private loadUser(): void {
    this.isLoading = true;
    this.errorMsgKey = null;
    this.svc.getClientById(this.userId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: user => this.fillForm(user),
      error: ()    => this.errorMsgKey = 'navbar.error.loadProfile'
    });
  }

  private fillForm(u: Client): void {
    this.form = {
      nom:            u.nom,
      prenom:         u.prenom,
      email:          u.email,
      mot_de_passe:   u.mot_de_passe,
      telephone:      u.telephone,
      genre:          u.genre,
      ethnicite:      u.ethnicite,
      role:           u.role,
      date_naissance: u.date_naissance
        ? new Date(u.date_naissance).toISOString().slice(0,10)
        : ''
    };
  }

  saveProfile(): void {
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
      error: () => this.errorMsgKey = 'navbar.error.updateProfile'
    });
  }

  closeDialog(): void {
    (this.profileDialog.nativeElement as any).close();
  }

  logout(): void {
    this.authservice.logout();
  }

  changeLanguage(lang: Lang): void {
    this.i18n.setLanguage(lang);
  }

  isActiveLang(lang: Lang): boolean {
    return this.i18n.currentLang === lang;
  }

  private populateSelectOptions(): void {
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
}
