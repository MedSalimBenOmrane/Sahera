export class Question {
  constructor(
    public id: number,
    public question: string,
    public sousThematiqueId: number,
    public options: string[] = []   
  ) {}
}