import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() mode: 'mes-reponses' | 'questionnaire' = 'questionnaire';

  @Input() id: number=0 ;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() publicationDate: Date | null = null;
  @Input() isSessionOpen: boolean = false;
  @Input() sessionCloseDate: Date | null = null;
  @Input() isAnswered: boolean = false;
  @Input() responseDate!: string;

  constructor(private router: Router ,private toastr: ToastrService, private i18n: TranslationService ) { }

  ngOnInit(): void {}

 onRespond(): void {
    if (!this.isSessionOpen) {
      this.toastr.error(this.i18n.translate('card.sessionClosed'), this.i18n.translate('auth.toast.errorTitle'),{ positionClass: 'toast-top-right' });
      return;
    }
    this.router.navigate(['/questionnaire', this.id, this.title]);
  }

  onModify(): void {
    if (!this.isSessionOpen) {
      this.toastr.error(this.i18n.translate('card.sessionClosed'), this.i18n.translate('auth.toast.errorTitle'),{ positionClass: 'toast-top-right' });
      return;
    }
    this.router.navigate(['/questionnaire', this.id, this.title]);
  }
  }
