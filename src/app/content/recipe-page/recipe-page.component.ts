import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, catchError, map, tap } from 'rxjs/operators';
import { RecipeEditState } from 'app/shared/interface/recipe-edit-state.interface';
import { DatabaseService } from 'app/shared/database.service';
import { Category } from '../interface/category.interface';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrls: ['./recipe-page.component.scss']
})
export class RecipePageComponent implements OnInit, OnDestroy {
  public recipe: Recipe;
  public state: RecipeEditState;
  private categoryList: Category[];
  private recipeCategories: string[];
  private destroy$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    public editModeService: EditModeService,
    private dbService: DatabaseService
  ) {
    this.dbService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.categoryList = c));
  }

  public ngOnInit(): void {
    let recipeId;
    combineLatest([
      this.route.paramMap.pipe(tap(params => (recipeId = params.get('rid')))),
      this.dbService.getRecipes()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, recipes]) => {
        this.recipe = recipes.find(r => r.id === recipeId);
        if (!this.recipe) {
          this.state = {
            id: recipeId,
            title: '',
            isFavourite: false,
            ingredients: '',
            prep: '',
            image: '',
            newRecipe: true,
            options: this.categoryList.map(category => {
              return { category, selected: false };
            })
          };
          this.editModeService.toggleEditMode(true);
          return;
        }
        this.state = {
          ...this.recipe,
          newRecipe: false,
          options: this.categoryList.map(category => {
            return { category, selected: this.recipe.categories.some(c => c.id === category.id) };
          })
        };

        this.recipeCategories = null;
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

  public onImageClick(recipeImageModal): void {
    recipeImageModal.open(this.recipe.id);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
