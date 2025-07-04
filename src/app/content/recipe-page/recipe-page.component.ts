import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecipeEditState } from 'app/shared/interface/recipe-edit-state.interface';
import { DatabaseService } from 'app/shared/database.service';
import { Category } from '../interface/category.interface';
import { ToastService } from 'app/shared/toast.service';
import { StateService } from 'app/shared/state.service';

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
  public striked = new Set<number>();
  public copyResultMessage: string;
  private categoryList: Category[];
  private recipeList: Recipe[];
  private destroy$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public editModeService: EditModeService,
    private dbService: DatabaseService,
    private toastService: ToastService,
    private stateService: StateService
  ) {
    this.isNew = history.state.isNew;
  }

  public ngOnInit(): void {
    combineLatest([this.route.paramMap, this.dbService.getRecipes(), this.dbService.getCategories()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, recipes, categories]) => {
        this.categoryList = categories;
        this.recipeList = recipes;
        const recipeId = params.get('rid');
        const recipeState = history.state.recipeState;
        this.recipe = recipes.find(r => r.id === recipeId);
        if (!this.recipe) {
          this.initNewRecipe(recipeId, recipeState);
          this.editModeService.toggleEditMode(true);
          return;
        }
        this.initExistingRecipe();
        this.striked = new Set<number>();
        const savedStriked = this.stateService.getStrikedSetById(recipeId);
        if (savedStriked) {
          this.striked = savedStriked;
        }
        this.activeStage = this.stateService.getStageNumberById(recipeId);
      });
  }

  @HostListener('click', ['$event.target']) onRecipePageClick(t): void {
    if (!t.closest('.back-button') && !t.closest('.link') && this.recipe) {
      this.stateService.setStateById(this.recipe.id, location.pathname, this.striked, this.activeStage, true);
    }
  }

  private initExistingRecipe(): void {
    this.state = {
      ...this.recipe,
      newRecipe: false,
      options: this.categoryList.map(category => {
        return { category, selected: this.recipe.categories.some(c => c.id === category.id) };
      }),
      relatedRecipes: this.recipeList.map(recipe => {
        return { recipe, selected: this.recipe.relatedRecipes?.some(c => c.id === recipe.id) };
      })
    };
  }

  private initNewRecipe(recipeId: string, recipeState: RecipeEditState): void {
    this.state = recipeState ?? {
      id: recipeId,
      title: '',
      isFavourite: false,
      ingredients: '',
      prep: '',
      link: '',
      duration: 0,
      quantity: '',
      image: '',
      relatedRecipes: [],
      newRecipe: true,
      options: []
    };

    this.state.options = this.categoryList.map(category => {
      return { category, selected: history.state.currentCategory === category.id };
    });
    this.state.relatedRecipes = this.recipeList.map(recipe => {
      return { recipe, selected: false };
    });
  }

  public shouldShowCopyButton(): boolean {
    return 'clipboard' in navigator;
  }

  private getShareText(): string {
    let text = `${this.recipe.title}`;

    if (this.recipe.ingredients) {
      text = text.concat(`

מצרכים:
${this.recipe.ingredients}`);
    }

    if (this.recipe.prep) {
      text = text.concat(`

אופן הכנה:
${this.recipe.prep}`);
    }

    if (this.recipe.link) {
      text = text.concat(`

לינק:
${this.recipe.link}`);
    }

    return text;
  }

  public onWhatsappClick(): void {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(this.getShareText())}`, '_blank');
  }

  public onEmailClick(): void {
    window.open(`mailto:?body=${encodeURIComponent(this.getShareText())}`, '_blank');
  }

  public async onCopyClick(copyResultToast): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getShareText());
      this.copyResultMessage = 'המתכון הועתק בהצלחה';
      this.toastService.show(copyResultToast, { classname: 'bg-success text-light', delay: 4000 });
    } catch (error) {
      this.copyResultMessage = 'ההעתקה נכשלה, נסו שוב או שתפו בדרך אחרת';
      this.toastService.show(copyResultToast, { classname: 'bg-danger text-light', delay: 4000 });
    }
  }

  public formatDuration(min: number): string {
    const hours = Math.floor(min / 60);
    const minutes = min - hours * 60;

    let hoursStr = '';
    if (hours === 1) hoursStr = 'שעה';
    else if (hours === 2) hoursStr = 'שעתיים';
    else if (hours > 2) hoursStr = hours + ' שעות';

    let minutesStr = hours && minutes ? ' ו-' : '';
    if (minutes) minutesStr += minutes + ' דקות';

    return `${hoursStr}${minutesStr}`;
  }

  public onCategoryLabelClick(categoryId: string): void {
    this.router.navigate(['categories', categoryId]);
  }

  public onRecipeLabelClick(recipeId: string): void {
    this.router.navigate(['recipes', recipeId]);
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
