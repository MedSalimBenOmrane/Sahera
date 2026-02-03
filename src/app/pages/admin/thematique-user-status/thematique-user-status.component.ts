import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Client } from 'src/app/models/client.model';
import { Question } from 'src/app/models/question.model';
import { ClientsService } from 'src/app/services/clients.service';
import { NotificationService } from 'src/app/services/notification.service';
import { QuestionService } from 'src/app/services/question.service';
import { ReponseService } from 'src/app/services/reponse.service';
import { SousThematiqueService } from 'src/app/services/sous-thematique.service';
import { ThematiqueService } from 'src/app/services/thematique.service';
import { TranslationService } from 'src/app/services/translation.service';
import { ToastrService } from 'ngx-toastr';

type UserStatus = 'complete' | 'incomplete';
type UserStatusRow = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  genre: string;
  status: UserStatus;
};
type StatusFilter = 'all' | UserStatus;

@Component({
  selector: 'app-thematique-user-status',
  templateUrl: './thematique-user-status.component.html',
  styleUrls: ['./thematique-user-status.component.css']
})
export class ThematiqueUserStatusComponent implements OnInit {
  @ViewChild('reminderDialog', { static: true }) reminderDialogRef!: ElementRef<HTMLDialogElement>;

  thematiqueId!: number;
  thematiqueTitre = '';
  thematiqueCloseDate: Date | null = null;

  isLoadingUsers = false;
  isLoadingAnswers = false;

  users: Client[] = [];
  statusRows: UserStatusRow[] = [];
  allCount = 0;
  completeCount = 0;
  incompleteCount = 0;

  currentPage = 1;
  perPage = 5;
  get totalPages(): number {
    const total = this.filteredStatusRows.length;
    return Math.max(1, Math.ceil(total / this.perPage));
  }
  get pageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private questionIds: number[] = [];
  private answersByUser = new Map<number, Set<number>>();
  private answersLoaded = false;
  private usersLoaded = false;

  filterStatus: StatusFilter = 'all';
  selectedUser: UserStatusRow | null = null;
  reminderSubject = '';
  reminderMessage = '';
  isSendingReminder = false;

  constructor(
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private stService: SousThematiqueService,
    private questionService: QuestionService,
    private reponseService: ReponseService,
    private thematiqueService: ThematiqueService,
    private notificationService: NotificationService,
    private toastr: ToastrService,
    public i18n: TranslationService
  ) {}

  get isLoading(): boolean {
    return this.isLoadingUsers || this.isLoadingAnswers;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.thematiqueId = id ? +id : 0;
      this.thematiqueTitre = params.get('titre') || '';
      this.filterStatus = 'all';
      this.currentPage = 1;
      this.loadThematiqueDetails();
      this.loadQuestionIndex();
      this.loadAllUsers();
    });
  }

  private loadThematiqueDetails(): void {
    if (!this.thematiqueId) return;
    this.thematiqueService.getById(this.thematiqueId).subscribe({
      next: t => {
        this.thematiqueCloseDate = t.dateFermetureSession;
        if (!this.thematiqueTitre) this.thematiqueTitre = t.titre;
      },
      error: err => {
        console.error('Erreur chargement thematique', err);
      }
    });
  }

  private loadQuestionIndex(): void {
    if (!this.thematiqueId) return;
    this.isLoadingAnswers = true;
    this.answersLoaded = false;
    this.questionIds = [];
    this.answersByUser.clear();

    this.stService.getByThematique(this.thematiqueId).subscribe({
      next: sts => {
        const requests = sts.map(st => this.questionService.getBySousThematique(st.id));
        const joined = requests.length ? forkJoin(requests) : of([]);
        joined.subscribe({
          next: (lists: Question[][] | any[]) => {
            const questions = (lists as Question[][]).flat();
            const ids = new Set(questions.map(q => q.id));
            this.questionIds = Array.from(ids);
            this.loadResponseIndex();
          },
          error: err => {
            console.error('Erreur chargement questions', err);
            this.isLoadingAnswers = false;
            this.answersLoaded = true;
            this.updateStatusRows();
          }
        });
      },
      error: err => {
        console.error('Erreur chargement sous-thematiques', err);
        this.isLoadingAnswers = false;
        this.answersLoaded = true;
        this.updateStatusRows();
      }
    });
  }

  private loadResponseIndex(): void {
    if (this.questionIds.length === 0) {
      this.isLoadingAnswers = false;
      this.answersLoaded = true;
      this.updateStatusRows();
      return;
    }

    const questionSet = new Set(this.questionIds);
    this.reponseService.getAll().subscribe({
      next: responses => {
        responses.forEach(r => {
          if (!questionSet.has(r.questionId)) return;
          const current = this.answersByUser.get(r.userId) || new Set<number>();
          current.add(r.questionId);
          this.answersByUser.set(r.userId, current);
        });
        this.isLoadingAnswers = false;
        this.answersLoaded = true;
        this.updateStatusRows();
      },
      error: err => {
        console.error('Erreur chargement reponses', err);
        this.isLoadingAnswers = false;
        this.answersLoaded = true;
        this.updateStatusRows();
      }
    });
  }

  private loadAllUsers(): void {
    this.isLoadingUsers = true;
    this.usersLoaded = false;

    const serverPerPage = 50;
    this.clientsService.getPage({ page: 1, per_page: serverPerPage, sort: 'nom,prenom' })
      .subscribe({
        next: ({ items, meta }) => {
          const pages = meta?.pages ?? 1;
          if (pages <= 1) {
            this.users = items;
            this.isLoadingUsers = false;
            this.usersLoaded = true;
            this.updateStatusRows();
            return;
          }

          const requests = [];
          for (let p = 2; p <= pages; p++) {
            requests.push(this.clientsService.getPage({ page: p, per_page: serverPerPage, sort: 'nom,prenom' }));
          }

          forkJoin(requests).subscribe({
            next: more => {
              const extra = more.flatMap(r => r.items);
              this.users = items.concat(extra);
              this.isLoadingUsers = false;
              this.usersLoaded = true;
              this.updateStatusRows();
            },
            error: err => {
              console.error('Erreur chargement pages participants', err);
              this.users = items;
              this.isLoadingUsers = false;
              this.usersLoaded = true;
              this.updateStatusRows();
            }
          });
        },
        error: err => {
          console.error('Erreur chargement participants', err);
          this.users = [];
          this.statusRows = [];
          this.isLoadingUsers = false;
          this.usersLoaded = true;
        }
      });
  }

  private updateStatusRows(): void {
    if (!this.usersLoaded || !this.answersLoaded) return;
    this.statusRows = this.users.map(user => ({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      genre: user.genre,
      status: this.getUserStatus(user.id)
    }));
    this.allCount = this.statusRows.length;
    this.completeCount = this.statusRows.filter(u => u.status === 'complete').length;
    this.incompleteCount = this.statusRows.filter(u => u.status === 'incomplete').length;
    this.clampPage();
  }

  get filteredStatusRows(): UserStatusRow[] {
    if (this.filterStatus === 'all') return this.statusRows;
    return this.statusRows.filter(u => u.status === this.filterStatus);
  }

  get paginatedStatusRows(): UserStatusRow[] {
    const start = (this.currentPage - 1) * this.perPage;
    return this.filteredStatusRows.slice(start, start + this.perPage);
  }

  private getUserStatus(userId: number): UserStatus {
    if (this.questionIds.length === 0) return 'complete';
    const answered = this.answersByUser.get(userId);
    if (!answered) return 'incomplete';
    return answered.size >= this.questionIds.length ? 'complete' : 'incomplete';
  }

  getStatusLabel(status: UserStatus): string {
    return status === 'complete'
      ? this.i18n.translate('admin.userStatus.completed')
      : this.i18n.translate('admin.userStatus.incomplete');
  }

  setFilter(status: StatusFilter): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.clampPage();
  }

  private clampPage(): void {
    const total = this.totalPages;
    if (this.currentPage > total) this.currentPage = total;
    if (this.currentPage < 1) this.currentPage = 1;
  }

  sendReminder(user: UserStatusRow): void {
    if (user.status === 'complete' || this.isSendingReminder) return;
    const draft = this.buildReminder(user);
    this.dispatchReminder(user.id, draft.subject, draft.message);
  }

  openReminderDialog(user: UserStatusRow): void {
    if (user.status === 'complete' || this.isSendingReminder) return;
    this.selectedUser = user;
    const draft = this.buildReminder(user);
    this.reminderSubject = draft.subject;
    this.reminderMessage = draft.message;
    (this.reminderDialogRef.nativeElement as any).showModal();
  }

  closeReminderDialog(): void {
    (this.reminderDialogRef.nativeElement as any).close();
    this.selectedUser = null;
  }

  sendReminderDraft(): void {
    if (!this.selectedUser || this.isSendingReminder) return;
    const subject = this.reminderSubject.trim();
    const message = this.reminderMessage.trim();
    if (!subject || !message) return;
    this.dispatchReminder(this.selectedUser.id, subject, message, true);
  }

  private dispatchReminder(userId: number, subject: string, message: string, closeOnSuccess = false): void {
    this.isSendingReminder = true;
    this.notificationService.sendNotification(subject, message, [userId]).subscribe({
      next: () => {
        this.toastr.success(this.i18n.translate('admin.userStatus.reminderSuccess'));
        this.isSendingReminder = false;
        if (closeOnSuccess) this.closeReminderDialog();
      },
      error: err => {
        console.error('Envoi rappel echoue', err);
        this.toastr.error(this.i18n.translate('admin.userStatus.reminderError'));
        this.isSendingReminder = false;
      }
    });
  }

  private buildReminder(user: UserStatusRow): { subject: string; message: string } {
    const name = this.getUserDisplayName(user);
    const namePart = name ? ` ${name}` : '';
    const title = this.thematiqueTitre || 'questionnaire';
    const closeDate = this.formatCloseDate();
    const closeDateFr = closeDate ? ` ${closeDate}` : '';
    const closeDateEn = closeDate ? ` ${closeDate}` : '';
    const salutationFr = this.getFrenchSalutation(user);
    const fr = `${salutationFr}${namePart}, vous n'avez pas encore complété la thématique ${title}. Merci de compléter le formulaire avant la date de clôture${closeDateFr}.`;
    const en = `English version below:\nDear client${namePart}, you have not completed the theme ${title} yet. Please complete the form before the closing date${closeDateEn}.`;
    return {
      subject: `Rappel questionnaire - ${title}`,
      message: `${fr}\n\n${en}`
    };
  }

  private getUserDisplayName(user: UserStatusRow): string {
    return [user.prenom, user.nom].filter(Boolean).join(' ').trim();
  }

  private getFrenchSalutation(user: UserStatusRow): string {
    const g = (user.genre || '').toLowerCase();
    const isFemale = g.startsWith('f') || g.includes('female') || g.includes('femme') || g.includes('woman');
    return isFemale ? 'Chère cliente' : 'Cher client';
  }

  private formatCloseDate(): string {
    if (!this.thematiqueCloseDate) return '';
    const d = this.thematiqueCloseDate;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private loadPage(page: number): void {
    this.currentPage = page;
    this.clampPage();
  }

  goToPage(p:number){ if(p<1 || p>this.totalPages || p===this.currentPage) return; this.loadPage(p); }
  firstPage(){ this.loadPage(1); }
  prevPage(){ this.loadPage(this.currentPage - 1); }
  nextPage(){ this.loadPage(this.currentPage + 1); }
  lastPage(){ this.loadPage(this.totalPages); }
}
