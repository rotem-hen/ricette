import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentModule } from './content/content.module';
import { NavbarItemsComponent } from './navbar-items/navbar-items.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { ToastsContainerComponent } from './toasts-container/toasts-container.component';
import { RecipeModalComponent } from './recipe-modal/recipe-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AddButtonComponent,
    NavbarItemsComponent,
    CategoryModalComponent,
    ToastsContainerComponent,
    RecipeModalComponent
  ],
  imports: [BrowserModule, FormsModule, FontAwesomeModule, ContentModule, NgbModule, ColorPickerModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
