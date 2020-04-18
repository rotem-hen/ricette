import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { CategoriesComponent } from './categories/categories.component';
import { RecipesComponent } from './recipes/recipes.component';
import { RecipePageComponent } from './recipe-page/recipe-page.component';
import { ContentComponent } from './content.component';
import { BackButtonComponent } from './back-button/back-button.component';

@NgModule({
  declarations: [
    ContentComponent,
    CategoriesComponent,
    RecipesComponent,
    RecipePageComponent,
    BackButtonComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'categories/:id', component: RecipesComponent },
      { path: '', component: CategoriesComponent },
      { path: '**', component: CategoriesComponent }
    ])
  ],
  exports: [
    ContentComponent,
    BackButtonComponent
  ],
  bootstrap: [CategoriesComponent]
})
export class ContentModule { }
