// src/app/models/reponse.model.ts
export type ReponseValeur = string | string[];

export class Reponse {
  constructor(
    public id: number,
    public valeur: ReponseValeur,
    public dateReponse: Date,
    public questionId: number,
    public userId: number,
    public valeurFr?: ReponseValeur,
    public valeurEn?: ReponseValeur,
    public valeurBrute?: ReponseValeur
  ) {}
}
