import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SousThematique } from 'src/app/models/sous-thematique.model';
import { Question } from 'src/app/models/question.model';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';  // à créer
import { Console } from 'console';


interface Row {
  sous: string;
  question: string;
  count: number;
}
@Component({
  selector: 'app-thematique-details',
  templateUrl: './thematique-details.component.html',
  styleUrls: ['./thematique-details.component.css']
})
export class ThematiqueDetailsComponent implements OnInit {
  thematiqueId!: number;
  thematiqueTitre!: string;
  sousThematiques: SousThematique[] = [];
   sortColumn = 'count';
  sortAsc = true;
   rows: Row[] = [];
  questionsMap: { [stId: number]: Question[] } = {};
  responseCountMap: { [qId: number]: number } = {};
isLoading = false;
  constructor(
    private route: ActivatedRoute,
    private stService: SousThematiqueService,
    private qService: QuestionService,
    private rService: ReponseService,
     private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const titre = params.get('titre');
      if (id) this.thematiqueId = +id;
      if (titre) this.thematiqueTitre = titre;
      this.loadSousThematiques();
    });
  }

  private loadSousThematiques(): void {
    this.isLoading = true; 
    this.stService.getByThematique(this.thematiqueId).subscribe(
      sts => {
        this.sousThematiques = sts;
        for (const st of sts) {
          this.loadQuestions(st.id);
        }
      
        this.isLoading = false;
    

      },
      err => {
         console.error('Erreur chargement sous-thématiques', err);
        this.isLoading = false;  // ← et même en cas d’erreur
       }
      
    );
  }

  private loadQuestions(stId: number): void {
    this.qService.getBySousThematique(stId).subscribe(
      qs => {
        this.questionsMap[stId] = qs;
        for (const q of qs) {
          this.loadResponseCount(q.id);
        }
      },
      err => {
        console.error(`Erreur questions ST ${stId}`, err);
        this.questionsMap[stId] = [];
      }
    );
  }

  private loadResponseCount(qId: number): void {
    this.rService.getCountByQuestion(qId).subscribe({
      next: cnt => { this.responseCountMap[qId] = cnt; console.log("nombre de reponse",cnt)},
      error: () => { this.responseCountMap[qId] = 0;  console.log("pas de reponse pour ",qId) }
    });
    
  }

  private applySort() {
    this.rows.sort((a, b) => {
      const va = (a as any)[this.sortColumn];
      const vb = (b as any)[this.sortColumn];
      if (va === vb) return 0;
      return this.sortAsc 
        ? (va < vb ? -1 : 1) 
        : (va > vb ? -1 : 1);
    });
  }
   sortTable(column: keyof Row) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
    this.applySort();
  }
  goToQuestionDetails(q: Question): void {
  this.router.navigate(
    ['/admin/question', q.id],
    { queryParams: { titre: q.question } }
  );
     
}
}