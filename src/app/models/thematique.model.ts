export class Thematique {
  constructor(
    public id: number,
    public titre: string,
    public dateOuvertureSession: Date | null, 
    public dateFermetureSession: Date | null, 
    public description: string
  ) {}
}
