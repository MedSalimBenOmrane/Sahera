// src/app/models/reponse.model.ts
export class Reponse {
  constructor(
    public id: number,
    public valeur: string,
    public dateReponse: Date,
    public questionId: number,
    public userId: number
  ) {}
}