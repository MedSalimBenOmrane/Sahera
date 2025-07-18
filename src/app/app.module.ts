import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbPopoverModule } from 'mdb-angular-ui-kit/popover';
import { MdbRadioModule } from 'mdb-angular-ui-kit/radio';
import { MdbRangeModule } from 'mdb-angular-ui-kit/range';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbScrollspyModule } from 'mdb-angular-ui-kit/scrollspy';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { LayoutComponent } from './components/layout/layout.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MesReponsesComponent } from './pages/mes-reponses/mes-reponses.component';
import { CardComponent } from './components/card/card.component';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { QAndAComponent } from './pages/q-and-a/q-and-a.component';
import { LogInSignINComponent } from './pages/log-in-sign-in/log-in-sign-in.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ClientsComponent } from './pages/admin/clients/clients.component';
import { CreateNotificationComponent } from './pages/admin/create-notification/create-notification.component';
import { AdminNavBarComponent } from './components/admin-nav-bar/admin-nav-bar.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { GenrateQuestionnaireComponent } from './pages/admin/genrate-questionnaire/genrate-questionnaire.component';
import { AdminQCardComponent } from './components/admin-qcard/admin-qcard.component';
import { ThematiqueDetailsComponent } from './pages/admin/thematique-details/thematique-details.component';
import { QuestionDetailsComponent } from './pages/admin/question-details/question-details.component';
import { HttpClientModule } from '@angular/common/http';
import { ComingSoonPageComponent } from './pages/coming-soon-page/coming-soon-page.component';
import { EditCoordonneesUserComponent } from './components/edit-coordonnees-user/edit-coordonnees-user.component';
import { BarChartComponent } from './components/dashboard/bar-chart/bar-chart.component';
import { CustomLineChartComponent } from './components/dashboard/custom-line-chart/custom-line-chart.component';
import { LineChartComponent } from './components/dashboard/line-chart/line-chart.component';
import { PieChartComponent } from './components/dashboard/pie-chart/pie-chart.component';
@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    FooterComponent,
    NavbarComponent,
    MesReponsesComponent,
    CardComponent,
    QuestionnaireComponent,
    QAndAComponent,
    LogInSignINComponent,
    NotificationsComponent,
    NotificationComponent,
    ClientsComponent,
    CreateNotificationComponent,
    AdminNavBarComponent,
    BarChartComponent,
    CustomLineChartComponent,
    LineChartComponent,
    PieChartComponent,
    DashboardComponent,
     GenrateQuestionnaireComponent,
     AdminQCardComponent,
     ThematiqueDetailsComponent,
     QuestionDetailsComponent,
     ComingSoonPageComponent,
     EditCoordonneesUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    }),
    MatIconModule,
    MdbAccordionModule,
    MdbCarouselModule,
    MdbCheckboxModule,
    MdbCollapseModule,
    MdbDropdownModule,
    MdbFormsModule,
    MdbModalModule,
    MdbPopoverModule,
    MdbRadioModule,
    MdbRangeModule,
    MdbRippleModule,
    MdbScrollspyModule,
    MdbTabsModule,
    MdbTooltipModule,
    MdbValidationModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
