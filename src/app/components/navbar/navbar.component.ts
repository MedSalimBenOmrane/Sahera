import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';
import { NotificationService } from 'src/app/services/notification.service';
import dialogPolyfill from 'dialog-polyfill';
import { AuthService } from 'src/app/services/auth.service';

interface FormField {
  key: keyof ClientForm;
  label: string;
  type: 'text' | 'email' | 'password' | 'date' | 'select';
  options?: string[];
}
type ClientForm = Omit<Client, 'date_naissance'> & { date_naissance?: string };

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit,AfterViewInit  {

  @ViewChild('profileDialog', { static: true })
  profileDialog!: ElementRef<HTMLDialogElement>;
  ngAfterViewInit() {
    dialogPolyfill.registerDialog(this.profileDialog.nativeElement);
  }
  form: Partial<ClientForm> = {};
  isLoading = false;
  errorMsg: string | null = null;
  private userId!: number;

  formFields: FormField[] = [
    { key: 'nom',            label: 'Nom',           type: 'text' },
    { key: 'prenom',         label: 'Prénom',        type: 'text' },
    { key: 'email',          label: 'Email',         type: 'email' },
    { key: 'mot_de_passe',   label: 'Nouveau Mot de passe',  type: 'password' },
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
    private notificationService: NotificationService,
    private authservice: AuthService,
    private svc: ClientsService,
    private router: Router
  ) {}
  unreadTotal$ = this.notificationService.unreadTotal$;
  ngOnInit(): void {
    // Chargement des notifications existant
    this.notificationService.getNotificationsForCurrentUser().subscribe({
      error: err => console.error('Notif failed', err)
    });
    this.notificationService.refreshUnreadTotal();
  }

unreadTotal = 0;



private refreshUnread(): void {
  this.notificationService.getUnreadTotal().subscribe({
    next: n => this.unreadTotal = n,
    error: () => this.unreadTotal = 0
  });
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
    this.errorMsg = null;
    this.svc.getClientById(this.userId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: user => this.fillForm(user),
      error: _    => this.errorMsg = 'Impossible de charger vos données.'
    });
  }

  private fillForm(u: Client) {
    this.form = {
      nom:            u.nom,
      prenom:         u.prenom,
      email:          u.email,
      mot_de_passe:   u.mot_de_passe,  // on ne pré-remplit pas le mot de passe
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
      error: () => this.errorMsg = 'Erreur lors de la mise à jour.'
    });
  }

  closeDialog(): void {
    (this.profileDialog.nativeElement as any).close();
  }

  logout():void {
    this.authservice.logout();
  }
}
