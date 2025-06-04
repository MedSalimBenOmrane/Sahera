export class Question {
  constructor(
    public id: number,
    public question: string,
    public typeQuestion: string,
    public options: string[],
    public sousThematiqueId: number
  ) {}
}
