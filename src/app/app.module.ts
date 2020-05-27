import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentModule } from './content/content.module';
import { SharedModule } from './shared/shared.module';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestore, AngularFirestoreModule } from 'angularfire2/firestore';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireAuth } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { ContentComponent } from './content/content.component';

@NgModule({
  declarations: [AppComponent, NavbarComponent, AddButtonComponent],
  imports: [
    SharedModule,
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    ContentModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RouterModule.forRoot([
      { path: 'categories', component: ContentComponent },
      { path: 'login', component: AppComponent },
      { path: '', component: AppComponent },
      { path: '**', component: AppComponent }
    ])
  ],
  exports: [],
  providers: [AngularFirestore, AngularFireAuth],
  bootstrap: [AppComponent]
})
export class AppModule {}
