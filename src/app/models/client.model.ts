export class Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  telephone: string;
  date_naissance: Date;
  genre: string;
  role: string;
  ethnicite: string;     

  constructor(
    id: number = 0,
    nom: string = '',
    prenom: string = '',
    email: string = '',
    mot_de_passe: string = '',
    telephone: string = '',
    date_naissance: Date = new Date(),
    genre: string = '',
    role: string = '',
    ethnicite: string = ''
  ) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.mot_de_passe = mot_de_passe;
    this.telephone = telephone;
    this.date_naissance = date_naissance;
    this.genre = genre;
    this.role = role;
    this.ethnicite = ethnicite; 
  }
}
