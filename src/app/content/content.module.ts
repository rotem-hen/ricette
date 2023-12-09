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
import { NavbarComponent } from 'app/navbar/navbar.component';
import { AddButtonComponent } from 'app/add-button/add-button.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthGuard } from 'app/shared/auth.guard';

@NgModule({
  declarations: [
    NavbarComponent,
    AddButtonComponent,
    ContentComponent,
    CategoriesComponent,
    RecipesComponent,
    RecipePageComponent,
    ContentTitleComponent,
    RecipeEntryComponent
  ],
  imports: [
    FormsModule,
    FontAwesomeModule,
    NgbModule,
    SharedModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          canActivate: [AuthGuard],
          component: ContentComponent,
          children: [
            { path: 'recipes/:rid', component: RecipePageComponent },
            { path: 'categories/:cid', component: RecipesComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: '', redirectTo: '/categories', pathMatch: 'full' }
          ]
        }
      ],
      { relativeLinkResolution: 'legacy' }
    )
  ],
  exports: [ContentComponent, ContentTitleComponent],
  bootstrap: [CategoriesComponent]
})
export class ContentModule {}
