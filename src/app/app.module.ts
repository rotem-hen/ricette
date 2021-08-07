import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentModule } from './content/content.module';
import { SharedModule } from './shared/shared.module';
import { NgbModule, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './shared/auth.guard';
import { UpdateNotificationComponent } from './update-notification/update-notification.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { GlobalErrorHandler } from './shared/globalErrorHandler';
import { LoginPageComponent } from './login-page/login-page.component';
import { BackOfficeComponent } from './admin/back-office/back-office.component';

@NgModule({
  declarations: [AppComponent, UpdateNotificationComponent, LoginPageComponent],
  imports: [
    SharedModule,
    BrowserModule,
    FormsModule,
    NgbModule,
    FontAwesomeModule,
    ContentModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({ synchronizeTabs: true }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RouterModule.forRoot([
      { path: 'login', component: LoginPageComponent },
      { path: 'bo', component: BackOfficeComponent }
    ]),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule
  ],
  exports: [],
  providers: [
    AngularFirestore,
    AngularFireAuth,
    AngularFireStorage,
    ScreenTrackingService,
    UserTrackingService,
    NgbTooltipConfig,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
