import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
private clients: Client[] = [
    new Client(
      1,
      'Habib',
      'Achraf',
      'Achraf.Habib@gmail.com',
      'pass123',
      '0612345678',
      new Date(1990, 0, 1),  // mois indexé à 0
      'Male',
      'client'
    ),
    new Client(
      2,
      'Ben Omrane',
      'Salim',
      'benomrane.salim@gmail.com',
      'password',
      '0698765432',
      new Date(1985, 4, 15),
      'Male',
      'client'
    ),
  ];

  constructor() { }

  /** Récupère tous les clients depuis la mémoire */
  getClients(): Observable<Client[]> {
    return of(this.clients);
  }

  /** Récupère un client par son ID */
  getClientById(id: number): Observable<Client | undefined> {
    const client = this.clients.find(c => c.id === id);
    return of(client);
  }

  /** Crée un nouveau client en mémoire */
  createClient(client: Client): Observable<Client> {
    // Auto-incrément ID
    client.id = this.clients.length
      ? Math.max(...this.clients.map(c => c.id)) + 1
      : 1;
    this.clients.push(client);
    return of(client);
  }

  /** Met à jour un client existant en mémoire */
  updateClient(client: Client): Observable<Client> {
    const idx = this.clients.findIndex(c => c.id === client.id);
    if (idx !== -1) {
      this.clients[idx] = client;
    }
    return of(client);
  }

  /** Supprime un client en mémoire */
  deleteClient(id: number): Observable<void> {
    this.clients = this.clients.filter(c => c.id !== id);
    return of(undefined);
  }
}