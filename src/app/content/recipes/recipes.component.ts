import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { data } from '../../db';
import { categoryViews, CategoriesIds } from '../category-views/category-views';
import { Category } from '../interface/category.interface';
import { Recipe } from '../interface/recipe.interface';
import { Scroller } from 'app/shared/scroll-top';
import { SearchService } from 'app/shared/search-service/search.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  public categoryName = '';
  public searchCategoryName = categoryViews.find(c => c.id === CategoriesIds.SEARCH_RESULTS).name;
  public categoryId: string;
  public recipesList: Recipe[];
  public CategoriesIds;

  constructor(private route: ActivatedRoute, private scroller: Scroller, private searchService: SearchService) {}

  ngOnInit(): void {
    this.CategoriesIds = CategoriesIds;
    this.route.params.subscribe((params: Params) => {
      this.categoryId = params['cid'];
      const categories: Category[] = data.categories;
      const category = categories.concat(categoryViews).find(category => category.id === this.categoryId);
      this.categoryName = category.name;

      this.recipesList = data.recipes.filter(
        category.selector ? category.selector : (recipe: Recipe): boolean => recipe.categories.includes(category.id)
      );

      if (this.categoryId === CategoriesIds.SEARCH_RESULTS) {
        this.applySearch(this.searchService.searchTerm);

        this.searchService.searchTermChange.subscribe(value => {
          this.applySearch(value);
        });
      }
    });
  }

  private applySearch(value: string): void {
    this.categoryName = `${this.searchCategoryName}: ${value}`;
    this.recipesList = data.recipes.filter(r => r.title.includes(value));
  }
}
