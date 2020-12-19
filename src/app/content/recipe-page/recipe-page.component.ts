import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
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
  public isNew: boolean;
  public activeStage = -1;
  public striked = new Set();
  private categoryList: Category[];
  private destroy$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    public editModeService: EditModeService,
    private dbService: DatabaseService
  ) {
    this.isNew = history.state.isNew;
  }

  public ngOnInit(): void {
    combineLatest([this.route.paramMap, this.dbService.getRecipes(), this.dbService.getCategories()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, recipes, categories]) => {
        this.categoryList = categories;
        const recipeId = params.get('rid');
        this.recipe = recipes.find(r => r.id === recipeId);
        if (!this.recipe) {
          this.initNewRecipe(recipeId);
          this.editModeService.toggleEditMode(true);
          return;
        }
        this.initExistingRecipe();
      });
  }

  private initExistingRecipe(): void {
    this.state = {
      ...this.recipe,
      newRecipe: false,
      options: this.categoryList.map(category => {
        return { category, selected: this.recipe.categories.some(c => c.id === category.id) };
      })
    };
  }

  private initNewRecipe(recipeId: string): void {
    this.state = {
      id: recipeId,
      title: '',
      isFavourite: false,
      ingredients: '',
      prep: '',
      image: '',
      newRecipe: true,
      options: this.categoryList.map(category => {
        return { category, selected: history.state.currentCategory === category.id };
      })
    };
  }

  public onWhatsappClick(): void {
    const text = `${this.recipe.title}

מצרכים:
${this.recipe.ingredients}

אופן הכנה:
${this.recipe.prep}`;

    location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
  }

  public onImageClick(recipeImageModal): void {
    recipeImageModal.open(this.recipe.id);
  }

  public onStageClick(i: number): void {
    this.activeStage = this.activeStage === i ? -1 : i;
  }

  public onIngredientClick(i: number): void {
    this.striked[this.striked.has(i) ? 'delete' : 'add'](i);
  }

  public isStriked(i: number): boolean {
    return this.striked.has(i);
  }

  public isSubtitle(ing: string): boolean {
    return ing.endsWith(':');
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
