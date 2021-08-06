import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { RecipesComponent } from './recipes/recipes.component';
import { RecipePageComponent } from './recipe-page/recipe-page.component';
import { ContentComponent } from './content.component';
import { ContentTitleComponent } from './content-title/content-title.component';
import { RecipeEntryComponent } from './recipe-entry/recipe-entry.component';
import { SharedModule } from 'app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ContentComponent,
    CategoriesComponent,
    RecipesComponent,
    RecipePageComponent,
    ContentTitleComponent,
    RecipeEntryComponent
  ],
  imports: [
    NgbModule,
    SharedModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'recipes/:rid', component: RecipePageComponent },
      { path: 'categories/:cid', component: RecipesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: '**', component: CategoriesComponent }
    ])
  ],
  exports: [ContentComponent, ContentTitleComponent],
  bootstrap: [CategoriesComponent]
})
export class ContentModule {}
