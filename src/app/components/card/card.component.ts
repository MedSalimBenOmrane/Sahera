import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
 /** Mode d’affichage : 
   *  'mes-reponses' → on affiche le statut utilisateur + date de réponse + boutons Modifier/Supprimer 
   *  'questionnaire' → on affiche le bouton Répondre 
   */
  @Input() mode: 'mes-reponses' | 'questionnaire' = 'questionnaire';

  @Input() id: number=0 ;
  /** Titre du questionnaire ou du bloc */
  @Input() title: string = '';

  /** Petite description (max 2 lignes) */
  @Input() description: string = '';

  /** Date de publication (format ISO ou Date) */
  @Input() publicationDate: Date | null = null;

  /** 
   * Statut de la session de réponses : 
   *  true = ouvert, false = fermé 
   */
  @Input() isSessionOpen: boolean = false;

  /** Date de clôture de la session (format ISO ou Date) */
  @Input() sessionCloseDate: Date | null = null;

  /** 
   * (Uniquement pour mode='mes-reponses') 
   * Statut si l’utilisateur a terminé de répondre ou non 
   *  true = a fini, false = n’a pas encore fini 
   */
  @Input() isAnswered: boolean = false;

  /**
   * (Uniquement pour mode='mes-reponses' ET isAnswered === true)
   * Date à laquelle l’utilisateur a soumis ses réponses
   */
  @Input() responseDate!: string;

  constructor(private router: Router ,private toastr: ToastrService   ) { }

  ngOnInit(): void {
    // Vous pouvez faire un formatage local ici si nécessaire
  }

  /** Méthode utilitaire pour formater une date au format français (JJ/MM/AAAA) */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
 onRespond(): void {
    if (!this.isSessionOpen) {
      this.toastr.error('La session est fermée', 'Erreur',{ positionClass: 'toast-top-right' });
      return;
    }
    this.router.navigate(['/questionnaire', this.id, this.title]);
  }

  onModify(): void {
    if (!this.isSessionOpen) {
      this.toastr.error('La session est fermée', 'Erreur',{ positionClass: 'toast-top-right' });
      return;
    }
    this.router.navigate(['/questionnaire', this.id, this.title]);
  }
  }


