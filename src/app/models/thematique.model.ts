export class Thematique {
  constructor(
    public id: number,
    public titre: string,
    public dateOuvertureSession: Date | null, 
    public dateFermetureSession: Date | null, 
    public description: string,
    public titreFr?: string,
    public titreEn?: string,
    public descriptionFr?: string,
    public descriptionEn?: string
  ) {}
}
