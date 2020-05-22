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
import { AngularFirestore } from 'angularfire2/firestore';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AddButtonComponent
  ],
  imports: [
    SharedModule,
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    ContentModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  exports: [],
  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {}
