import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AddButtonComponent } from './add-new/add-button/add-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentModule } from './content/content.module';
import { NavbarItemsComponent } from './navbar-items/navbar-items.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewCategoryModalComponent } from './add-new/new-category-modal/new-category-modal.component';

@NgModule({
  declarations: [AppComponent, NavbarComponent, AddButtonComponent, NavbarItemsComponent, NewCategoryModalComponent],
  imports: [BrowserModule, FormsModule, FontAwesomeModule, ContentModule, NgbModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
