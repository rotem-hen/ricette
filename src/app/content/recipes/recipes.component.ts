import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { categoryViews, SpecialCategories } from '../category-views/category-views';
import { Recipe } from '../interface/recipe.interface';
import { SearchService } from 'app/shared/search.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatabaseService } from 'app/shared/database.service';
import { CategoryModalState } from 'app/shared/interface/category-modal-state.interface';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit, OnDestroy {
  public categoryName = '';
  public categoryId: string;
  public categoryColor: string;

  public searchCategoryName = categoryViews.find(c => c.id === SpecialCategories.SEARCH_RESULTS).name;
  public recipeList: Recipe[];
  private allRecipes: Recipe[];
  public SpecialCategories = SpecialCategories;
  private destroy$ = new Subject();

  private QUERY_PARAM = 'searchTerm';

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private dbService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.categoryId = params['cid'];
      combineLatest([this.dbService.getCategories(), this.dbService.getRecipes()])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([categories, recipes]) => {
          const allCategories = categories.concat(categoryViews);
          const category = allCategories.find(c => c.id === this.categoryId);
          this.categoryName = category.name;
          this.categoryColor = category.color;

          this.allRecipes = recipes;
          this.recipeList = recipes.filter(
            category.selector
              ? category.selector
              : (recipe: Recipe): boolean => recipe.categories.some(c => c.id === category.id)
          );

          if (this.categoryId === SpecialCategories.SEARCH_RESULTS) {
            const searchParam = new URLSearchParams(window.location.search).get(this.QUERY_PARAM);
            if (searchParam) this.searchService.searchTerm = searchParam;
            this.applySearch(this.searchService.searchTerm);

            this.searchService.searchTermChange.pipe(takeUntil(this.destroy$)).subscribe(value => {
              this.applySearch(value);
            });
          }
        });
    });
  }

  private applySearch(value: string): void {
    if (this.categoryId !== SpecialCategories.SEARCH_RESULTS) return;
    history.replaceState(history.state, '', `categories/${SpecialCategories.SEARCH_RESULTS}?${this.QUERY_PARAM}=${value}`);
    this.categoryName = `${this.searchCategoryName}: ${value}`;
    this.recipeList = this.allRecipes.filter(r => `${r.title}\n${r.ingredients}`.includes(value));
  }

  public onEditCategory(modalRef): () => void {
    return (): void => {
      const state: CategoryModalState = {
        id: this.categoryId,
        name: this.categoryName,
        color: this.categoryColor,
        options: this.allRecipes.map(recipe => {
          return { recipe, selected: recipe.categories.some(c => c.id === this.categoryId) };
        })
      };
      modalRef.open(state);
    };
  }

  public isStandardCategory(): boolean {
    return (
      this.categoryId !== SpecialCategories.ALL &&
      this.categoryId !== SpecialCategories.FAVORITES &&
      this.categoryId !== SpecialCategories.SEARCH_RESULTS &&
      this.categoryId !== SpecialCategories.UNCATEGORIZED
    );
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
