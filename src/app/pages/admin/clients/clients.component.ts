import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Client } from 'src/app/models/client.model';
import { ClientsService } from 'src/app/services/clients.service';

interface FormField {
  key: keyof Client;
  label: string;
  type: 'text'|'email'|'password'|'date'|'select';
  options?: string[];
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];

  // date en string pour le <input type="date">
  dateNaissanceValue = '';

  // Création vs édition
  isEditMode = false;
  currentId: number | null = null;

  // Form data
  form: Partial<Client> = {};

  formFields: FormField[] = [
    { key: 'nom',            label: 'Nom',           type: 'text' },
    { key: 'prenom',         label: 'Prénom',        type: 'text' },
    { key: 'email',          label: 'Email',         type: 'email' },
    { key: 'mot_de_passe',   label: 'Mot de passe',  type: 'password' },
    { key: 'telephone',      label: 'Téléphone',     type: 'text' },
    { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
    { key: 'genre',          label: 'Genre',         type: 'select', options: ['Male','Female'] },
    { key: 'role',           label: 'Rôle',          type: 'text' }
  ];

  @ViewChild('dialog', { static: true })
  private dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(private svc: ClientsService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients() {
    this.svc.getClients().subscribe(list => this.clients = list);
  }

  /** Ouvre le dialogue en mode création */
  openCreateDialog() {
    this.isEditMode = false;
    this.currentId  = null;
    this.form       = {};
    this.dateNaissanceValue = '';
    // on cast en any pour accéder à showModal()
    (this.dialogRef.nativeElement as any).showModal();
  }

  /** Ouvre le dialogue en mode édition */
  openEditDialog(c: Client) {
    this.isEditMode = true;
    this.currentId  = c.id;
    // pré-remplissage
    this.form = {
      nom:           c.nom,
      prenom:        c.prenom,
      email:         c.email,
      mot_de_passe:  c.mot_de_passe,
      telephone:     c.telephone,
      genre:         c.genre,
      role:          c.role
    };
    this.dateNaissanceValue = c.date_naissance.toISOString().slice(0,10);
    (this.dialogRef.nativeElement as any).showModal();
  }

  /** Crée ou met à jour */
  saveClient() {
    const dateObj = new Date(this.dateNaissanceValue);
    const payload = new Client(
      this.currentId ?? 0,
      this.form.nom          || '',
      this.form.prenom       || '',
      this.form.email        || '',
      this.form.mot_de_passe || '',
      this.form.telephone    || '',
      dateObj,
      this.form.genre        || '',
      this.form.role         || ''
    );

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
