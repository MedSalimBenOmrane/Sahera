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

  @ViewChild('dialog', { static: true })
  private dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private svc: ClientsService) {}

  ngOnInit(): void {
    this.loadClients();
  }

    private loadClients(): void {
    this.isLoading = true;
    this.errorMsg = null;

    this.svc.getClientsapi().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (list) => {
        this.clients = list;
        console.log('Clients reçus :', this.clients);
      },
      error: (err) => {
        console.error('Erreur API :', err);
        this.errorMsg = 'Impossible de charger les clients.';
      }
    });
  }

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
      this.form.nom          || '',
      this.form.prenom       || '',
      this.form.email        || '',
      this.form.mot_de_passe || '',
      this.form.telephone    || '',
      dateObj || new Date(),  
      this.form.genre        || '',
      this.form.role         || '',
      this.form.ethnicite    || ''
    );
console.log(payload)
    const obs = this.isEditMode
      ? this.svc.updateClient(payload)
      : this.svc.createClient(payload);

    obs.subscribe(() => this.loadClients());
    this.closeDialog();
  }


  confirmDelete(client: Client) {
    const fullName = `${client.nom} ${client.prenom}`;
    const message  = `Voulez-vous vraiment supprimer "${fullName}" ?`;
    // window.confirm renvoie true si “OK”, false si “Annuler”
    if (window.confirm(message)) {
      this.deleteClient(client.id);
    }
  }

  /** Supprime sans confirmation (appelé en interne) */
  private deleteClient(id: number) {
    this.svc.deleteClient(id)
      .subscribe(() => this.loadClients());
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
