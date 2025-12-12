export type QuestionType = 'liste' | 'text' | 'date';

export class Question {
  constructor(
    public id: number,
    public question: string,
    public sousThematiqueId: number,
    public options: string[] = [],
    public type: QuestionType = 'liste'
  ) {}
}
