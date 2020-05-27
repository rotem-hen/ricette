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
import { AuthGuard } from 'app/shared/auth-guard/auth.guard';

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
    SharedModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'recipes/:rid', component: RecipePageComponent, canActivate: [AuthGuard] },
      { path: 'categories/:cid', component: RecipesComponent, canActivate: [AuthGuard] },
      { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
      { path: '**', component: CategoriesComponent, canActivate: [AuthGuard] }
    ])
  ],
  exports: [ContentComponent, ContentTitleComponent],
  bootstrap: [CategoriesComponent]
})
export class ContentModule {}
