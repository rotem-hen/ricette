import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { data } from '../../db';
import { CategoriesTypes } from '../../enum/categories-types.enum';
@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  public categoryName = '';
  public categoryId: number;
  public recipesList = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.categoryId = +params['cid'];
      const category = data.categories.find(category => category.id === this.categoryId);
      this.categoryName = category.name;

      switch (this.categoryId) {
        case CategoriesTypes.UNCATEGORIZED:
          this.recipesList = data.recipes.filter(recipe => !recipe.categories.length);
          break;
        case CategoriesTypes.ALL:
          this.recipesList = data.recipes;
          break;
        case CategoriesTypes.FAVORITES:
          this.recipesList = data.recipes.filter(recipe => recipe.isFavourite);
          break;
        default:
          this.recipesList = data.recipes.filter(recipe => recipe.categories.includes(category.id));
      }
    });
  }
}
