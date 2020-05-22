import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { categoryViews, CategoriesIds } from '../category-views/category-views';
import { Recipe } from '../interface/recipe.interface';
import { SearchService } from 'app/shared/search-service/search.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatabaseService } from 'app/shared/database-service/database.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnDestroy {
  public categoryName = '';
  public searchCategoryName = categoryViews.find(c => c.id === CategoriesIds.SEARCH_RESULTS).name;
  public categoryId: string;
  public recipeList: Recipe[];
  private allRecipes: Recipe[];
  public CategoriesIds = CategoriesIds;
  private destroy$ = new Subject();

  constructor(private route: ActivatedRoute, private searchService: SearchService, private dbService: DatabaseService) {
    this.route.params.subscribe((params: Params) => {
      this.categoryId = params['cid'];
      combineLatest([this.dbService.getCategories(), this.dbService.getRecipes()])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([categories, recipes]) => {
          const allCategories = categories.concat(categoryViews);
          const category = allCategories.find(c => c.id === this.categoryId);
          this.categoryName = category.name;

          this.allRecipes = recipes;
          this.recipeList = recipes.filter(
            category.selector
              ? category.selector
              : (recipe: Recipe): boolean => recipe.categories.some(c => c.id === category.id)
          );

          if (this.categoryId === CategoriesIds.SEARCH_RESULTS) {
            this.applySearch(this.searchService.searchTerm);

            this.searchService.searchTermChange.pipe(takeUntil(this.destroy$)).subscribe(value => {
              this.applySearch(value);
            });
          }
        });
    });
  }

  private applySearch(value: string): void {
    if (this.categoryId !== CategoriesIds.SEARCH_RESULTS) return;
    this.categoryName = `${this.searchCategoryName}: ${value}`;
    this.recipeList = this.allRecipes.filter(r => r.title.includes(value));
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
