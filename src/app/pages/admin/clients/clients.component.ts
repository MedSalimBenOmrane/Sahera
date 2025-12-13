import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { finalize } from 'rxjs';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';
import { TranslationService } from 'src/app/services/translation.service';

interface FormField {
  key: keyof ClientForm;
  labelKey: string;
  type: 'text'|'email'|'password'|'date'|'select';
  options?: Array<{ value: string; labelKey: string }>;
}
type ClientForm = Omit<Client,'date_naissance'> & {
  date_naissance?: string;
  };
type Meta = {
  total: number; page: number; per_page: number; pages: number;
  has_next: boolean; has_prev: boolean; next: string|null; prev: string|null;
};

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
 isLoading = false;
  errorMsg: string | null = null;
searchId: number | null = null; 
searchNom: string = '';
searchPrenom: string = '';

displayedClients: Client[] = [];

get hasAnyFilter(): boolean {
  return (this.searchId !== null && this.searchId > 0)
      || !!this.searchNom.trim()
      || !!this.searchPrenom.trim();
}

  isEditMode = false;
  currentId: number | null = null;

  form: Partial<ClientForm> = {};

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
  meta?: Meta;
  currentPage = 1;
  perPage = 4; 
  get totalPages(): number { return this.meta?.pages ?? 1; }
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  @ViewChild('dialog', { static: true })
  private dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private svc: ClientsService, public i18n: TranslationService) {
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
    this.loadPage(1);
  }
onSearchChanged(): void {
  const id = this.searchId;
  if (id !== null && Number.isInteger(id) && id > 0) {
    this.fetchById(id);
    return;
  }
  this.recomputeDisplayed();
}

private fetchById(id: number): void {
  this.isLoading = true;
  this.svc.getClientById(id)
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (client) => this.displayedClients = [client],
      error: _ => this.displayedClients = []
    });
}

private recomputeDisplayed(): void {
  let list = [...this.clients];

  const nom = this.searchNom.trim().toLowerCase();
  const prenom = this.searchPrenom.trim().toLowerCase();

  if (nom) {
    list = list.filter(c => (c.nom || '').toLowerCase().startsWith(nom));
  }
  if (prenom) {
    list = list.filter(c => (c.prenom || '').toLowerCase().startsWith(prenom));
  }
  this.displayedClients = list;
}

 private loadPage(page: number): void {
  this.isLoading = true;
  this.errorMsg = null;

  this.svc.getPage({ page, per_page: this.perPage, sort: 'nom,prenom' })
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: ({ items, meta }) => {
        this.clients = items;
        this.meta = meta as Meta;
        this.currentPage = this.meta.page;
        this.recomputeDisplayed(); 
      },
      error: err => {
        console.error('Erreur API :', err);
        this.errorMsg = 'Impossible de charger les participants.';
        this.clients = [];
        this.displayedClients = [];
        this.meta = undefined;
      }
    });
}

  goToPage(p:number){ if(p<1 || p>this.totalPages || p===this.currentPage) return; this.loadPage(p); }
  firstPage(){ this.goToPage(1); }
  prevPage(){ this.goToPage(this.currentPage - 1); }
  nextPage(){ this.goToPage(this.currentPage + 1); }
  lastPage(){ this.goToPage(this.totalPages); }

  openCreateDialog() {
    this.isEditMode = false;
    this.currentId  = null;
    this.form       = {};
    (this.dialogRef.nativeElement as any).showModal();
  }

openEditDialog(c: Client): void {
  this.isEditMode = true;
  this.currentId  = c.id;
    const dateObj = typeof c.date_naissance === 'string'
    ? new Date(c.date_naissance)
    : c.date_naissance;
  this.form = {
    nom:            c.nom,
    prenom:         c.prenom,
    email:          c.email,
    mot_de_passe:   c.mot_de_passe,
    telephone:      c.telephone,
    genre:          c.genre,
    ethnicite:      c.ethnicite,
    role:           c.role,
    date_naissance: dateObj
      ? dateObj.toISOString().slice(0,10)
      : ''
  };
  (this.dialogRef.nativeElement as any).showModal();
}

saveClient() {
  const dateObj = new Date(this.form.date_naissance as string);
  const payload = new Client(
    this.currentId ?? 0,
    this.form.nom || '',
    this.form.prenom || '',
    this.form.email || '',
    this.form.mot_de_passe || '',
    this.form.telephone || '',
    dateObj || new Date(),
    this.form.genre || '',
    this.form.role || '',
    this.form.ethnicite || ''
  );

  const obs = this.isEditMode
    ? this.svc.updateClient(payload)
    : this.svc.createClient(payload);

  obs.subscribe({
    next: () => {
      this.closeDialog();
      const target = this.isEditMode ? this.currentPage : 1;
      this.loadPage(target);
    },
    error: err => console.error('Erreur sauvegarde', err)
  });
}



confirmDelete(client: Client) {
  const fullName = `${client.nom} ${client.prenom}`;
  if (!window.confirm(this.i18n.translate('admin.confirmDelete', { name: fullName }))) {
    return;
  }

  const targetPage =
    (this.clients.length === 1 && this.currentPage > 1)
      ? this.currentPage - 1
      : this.currentPage;

  this.svc.deleteClient(client.id).subscribe({
    next: () => this.loadPage(targetPage),
    error: err => console.error('Suppression impossible', err)
  });
}



  closeDialog() {
    (this.dialogRef.nativeElement as any).close();
  }
    sortTable(column: keyof Client, asc: boolean): void {
    this.clients.sort((a,b) => {
      const va = (a[column] ?? '').toString().toLowerCase();
      const vb = (b[column] ?? '').toString().toLowerCase();
      return asc ? (va<vb?-1:(va>vb?1:0)) : (va<vb?1:(va>vb?-1:0));
    });
  }
  
}
