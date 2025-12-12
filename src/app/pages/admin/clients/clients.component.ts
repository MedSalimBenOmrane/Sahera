import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { finalize } from 'rxjs';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';

interface FormField {
  key: keyof ClientForm;
  label: string;
  type: 'text'|'email'|'password'|'date'|'select';
  options?: string[];
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
  // date en string pour le <input type="date">
// Recherches
searchId: number | null = null; 
searchNom: string = '';
searchPrenom: string = '';

// Liste affichée (filtrée ou résultat ID)
displayedClients: Client[] = [];

// Indicateur filtre actif (pour cacher pagination)
get hasAnyFilter(): boolean {
  // ID présent OU nom/prénom saisis
  return (this.searchId !== null && this.searchId > 0)
      || !!this.searchNom.trim()
      || !!this.searchPrenom.trim();
}

  // Création vs édition
  isEditMode = false;
  currentId: number | null = null;

  // Form data
  form: Partial<ClientForm> = {};

  formFields: FormField[] = [
    { key: 'nom',            label: 'Nom',           type: 'text' },
    { key: 'prenom',         label: 'Prénom',        type: 'text' },
    { key: 'email',          label: 'Email',         type: 'email' },
    { key: 'mot_de_passe',   label: 'Mot de passe',  type: 'password' },
    { key: 'telephone',      label: 'Téléphone',     type: 'text' },
    { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
    { key: 'genre',          label: 'Genre',         type: 'select', options: ['Homme','Femme'] },
    { key: 'ethnicite',      label: 'Ethnicité',     type: 'select', options: [
      'Amérindien ou Autochtone d’Alaska',
      'Asiatique',
      'Noir ou Afro-Américain',
      'Hispanique ou Latino',
      'Moyen-Oriental ou Nord-Africain',
      'Océanien (Hawaïen ou des îles du Pacifique)',
      'Blanc ou Européen Américain'
    ]},
    { key: 'role',           label: 'Rôle',          type: 'text' }
  ];
  // 🔹 Pagination
  meta?: Meta;
  currentPage = 1;
  perPage = 4; // MAX_PER_PAGE côté back
  get totalPages(): number { return this.meta?.pages ?? 1; }
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  @ViewChild('dialog', { static: true })
  private dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private svc: ClientsService) {}

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
  this.svc.getClientById(id)   // << use mapping
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (client) => this.displayedClients = [client],
      error: _ => this.displayedClients = []   // 404 → aucun résultat
    });
}

private recomputeDisplayed(): void {
  // Si ID est vide -> filtre local nom/prénom
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
        this.recomputeDisplayed();  // << afficher selon filtres
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

  // 🔹 handlers pagination
  goToPage(p:number){ if(p<1 || p>this.totalPages || p===this.currentPage) return; this.loadPage(p); }
  firstPage(){ this.goToPage(1); }
  prevPage(){ this.goToPage(this.currentPage - 1); }
  nextPage(){ this.goToPage(this.currentPage + 1); }
  lastPage(){ this.goToPage(this.totalPages); }



  /** Ouvre le dialogue en mode création */
  openCreateDialog() {
    this.isEditMode = false;
    this.currentId  = null;
    this.form       = {};
    // on cast en any pour accéder à showModal()
    (this.dialogRef.nativeElement as any).showModal();
  }

  /** Ouvre le dialogue en mode édition */
openEditDialog(c: Client): void {
  console.log('openEditDialog appelé pour', c);
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
    // 2) Puis on peut appeler toISOString() sans crainte
    date_naissance: dateObj
      ? dateObj.toISOString().slice(0,10)
      : ''
  };
  (this.dialogRef.nativeElement as any).showModal();
}

  /** Crée ou met à jour */
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
  if (!window.confirm(`Voulez-vous vraiment supprimer "${fullName}" ?`)) {
    return;
  }

  // 👉 si on supprime le dernier item de la page et qu'il existe une page précédente,
  // on reculera d'une page; sinon on reste sur la page actuelle.
  const targetPage =
    (this.clients.length === 1 && this.currentPage > 1)
      ? this.currentPage - 1
      : this.currentPage;

  this.svc.deleteClient(client.id).subscribe({
    next: () => this.loadPage(targetPage),
    error: err => console.error('Suppression impossible', err)
  });
}



  /** Ferme le dialog */
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
