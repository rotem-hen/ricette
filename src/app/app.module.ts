import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentModule } from './content/content.module';
import { NavbarItemsComponent } from './navbar-items/navbar-items.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AddButtonComponent,
    NavbarItemsComponent
  ],
  imports: [
    SharedModule,
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    ContentModule
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
