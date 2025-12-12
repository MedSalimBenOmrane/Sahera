import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClientsService } from 'src/app/services/clients.service';
import { ReponseService } from 'src/app/services/reponse.service';
interface Row {
  userId: number;
  nom: string;
  prenom: string;
  valeur: string;
}
@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {
  questionId!: number;
  questionTitre!: string;
  isLoading = false;
  rows: Row[] = [];

  constructor(
    private route: ActivatedRoute,
    private reponseService: ReponseService,
    private clientsService: ClientsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.questionId = +params.get('id')!;
      this.questionTitre = this.route.snapshot.queryParamMap.get('titre') || '';
      this.loadResponses();
    });
  }

private loadResponses(): void {
    this.isLoading = true;  // ← démarrage du loader

    this.reponseService.getByQuestion(this.questionId).subscribe(
      reps => {
        if (reps.length === 0) {
          this.rows = [];
          this.isLoading = false;  // ← on arrête le loader
          return;
        }
        const calls = reps.map(rep =>
          this.clientsService.getClientById(rep.userId)
        );
        forkJoin(calls).subscribe(
          clients => {
            this.rows = reps.map((rep, i) => {
              const c = clients[i];
              return {
                userId: c?.id   ?? rep.userId,
                nom:    c?.nom  ?? '—',
                prenom: c?.prenom ?? '—',
                valeur: rep.valeur
              };
            });
            this.isLoading = false;  // ← on arrête le loader
          },
          err => {
            console.error(err);
            this.rows = [];
            this.isLoading = false;  // ← aussi en cas d'erreur
          }
        );
      },
      err => {
        console.error(err);
        this.rows = [];
        this.isLoading = false;  // ← idem erreur
      }
    );
  }
}
