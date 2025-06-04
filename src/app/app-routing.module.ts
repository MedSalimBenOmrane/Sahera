import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MesReponsesComponent } from './pages/mes-reponses/mes-reponses.component';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { QAndAComponent } from './pages/q-and-a/q-and-a.component';
import { LogInSignINComponent } from './pages/log-in-sign-in/log-in-sign-in.component';

const routes: Routes = [
  {path: '',component: LogInSignINComponent},
  {path: 'mes-reponses', component: MesReponsesComponent ,},
  {path: 'questionnaire',component:QuestionnaireComponent ,},
  { path: 'questionnaire/:id/:titre', component: QAndAComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
