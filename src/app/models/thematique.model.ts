export class Thematique {
  constructor(
    public id: number,
    public titre: string,
    public dateCreation: Date,
    public dateFermetureSession: Date,
    public description: string
  ) {}
}
