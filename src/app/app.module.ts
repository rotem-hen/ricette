import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TopPanelComponent } from './top-panel/top-panel.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentModule } from './content/content.module';

@NgModule({
  declarations: [AppComponent, TopPanelComponent, AddButtonComponent],
  imports: [BrowserModule, FormsModule, FontAwesomeModule, ContentModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
