import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
private apiUrl = 'http://localhost:5000/api/utilisateurs';  // ← l’endpoint Flask
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

  constructor(private http: HttpClient) { }
  getClientsapi(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }
  /** Récupère tous les clients depuis la mémoire */
  getClients(): Observable<Client[]> {
    return of(this.clients);
  }

  /** Récupère un client par son ID */
  /** Récupère un client par son ID */
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  /** Crée un nouveau client via POST */
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  /** Met à jour un client existant via PUT */
  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${client.id}`, client);
  }

  /** Supprime un client via DELETE */
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}