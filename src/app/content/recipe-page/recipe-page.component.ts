import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecipeModalState } from 'app/shared/recipe-modal/interface/recipe-modal-state.interface';
import { DatabaseService } from 'app/shared/database-service/database.service';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrls: ['./recipe-page.component.css']
})
export class RecipePageComponent implements OnDestroy {
  @ViewChild('recipeModal') recipeModalRef;
  public recipe: Recipe;
  private destroy$ = new Subject();

  constructor(private route: ActivatedRoute, public editMode: EditModeService, private dbService: DatabaseService) {
    combineLatest([this.dbService.getCategories(), this.dbService.getRecipes()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([categories, recipes]) => {
        const recipeId = this.route.snapshot.paramMap.get('rid');
        this.recipe = recipes.find(r => r.id === recipeId);
        this.editMode.editModeChange.pipe(takeUntil(this.destroy$)).subscribe((value: boolean) => {
          if (value) {
            const state: RecipeModalState = {
              ...this.recipe,
              options: categories.map(category => {
                return { category, selected: this.recipe.categories.some(c => c.id === category.id) };
              })
            };
            this.recipeModalRef.open(state);
          }
        });
      });
  }

  public onWhatsappClick(): void {
    let text = `${this.recipe.title}

מצרכים:
${this.recipe.ingredients}

אופן הכנה:
${this.recipe.prep}`;

    text = encodeURI(text);
    location.href = `whatsapp://send?text=${text}`;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
