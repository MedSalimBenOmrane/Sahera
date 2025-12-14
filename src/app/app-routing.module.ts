// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MesReponsesComponent } from './pages/mes-reponses/mes-reponses.component';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { QAndAComponent } from './pages/q-and-a/q-and-a.component';
import { LogInSignINComponent } from './pages/log-in-sign-in/log-in-sign-in.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { CreateNotificationComponent } from './pages/admin/create-notification/create-notification.component';
import { ClientsComponent } from './pages/admin/clients/clients.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { GenrateQuestionnaireComponent } from './pages/admin/genrate-questionnaire/genrate-questionnaire.component';
import { ThematiqueDetailsComponent } from './pages/admin/thematique-details/thematique-details.component';
import { QuestionDetailsComponent } from './pages/admin/question-details/question-details.component';
import { ComingSoonPageComponent } from './pages/coming-soon-page/coming-soon-page.component';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';

const routes: Routes = [
  // Login accessible uniquement si non connecte
  { path: 'login', component: LogInSignINComponent, canActivate: [NoAuthGuard] },
  { path: 'landingpage', component: LandingPageComponent, canActivate: [NoAuthGuard] },

  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'participants', component: ClientsComponent },
      { path: 'questionnaires', component: GenrateQuestionnaireComponent },
      { path: 'thematique/:id/:titre', component: ThematiqueDetailsComponent },
      { path: 'question/:id', component: QuestionDetailsComponent },
      { path: 'messages', component: CreateNotificationComponent },
    ]
  },

  // Zones protegees (utilisateur connecte)
  { path: 'mes-reponses', component: MesReponsesComponent, canActivate: [AuthGuard] },
  { path: 'questionnaire', component: QuestionnaireComponent, canActivate: [AuthGuard] },
  { path: 'questionnaire/:id/:titre', component: QAndAComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },

  { path: 'coming_soon', component: ComingSoonPageComponent },

  // Par defaut, on va vers la landing page
  { path: '', redirectTo: 'landingpage', pathMatch: 'full' },
  { path: '**', redirectTo: 'landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
