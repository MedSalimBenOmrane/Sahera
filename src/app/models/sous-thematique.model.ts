export class SousThematique {
  constructor(
    public id: number,
    public titre: string,
    public thematiqueId: number,
    public titreFr?: string,
    public titreEn?: string
  ) {}
}
