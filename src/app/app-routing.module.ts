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


const routes: Routes = [
  {
    path: 'admin',
    //canActivate: [AdminGuard],    // optionnel, si vous voulez protéger
    children: [
      { path: '', redirectTo: 'Dashbord', pathMatch: 'full' },
      {path:'Dashbored' , component:DashboardComponent },
      { path: 'participants', component: ClientsComponent },
      { path: 'questionnaires', component: ClientsComponent },
      { path: 'messages', component: CreateNotificationComponent },
      
    ]
  },
  {path: '',component: LogInSignINComponent},
  {path: 'mes-reponses', component: MesReponsesComponent ,},
  {path: 'questionnaire',component:QuestionnaireComponent ,},
  { path: 'questionnaire/:id/:titre', component: QAndAComponent },
  { path: 'notifications', component: NotificationsComponent },
  
  { path: '**', redirectTo: '' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
