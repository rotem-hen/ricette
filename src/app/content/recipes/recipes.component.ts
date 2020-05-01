import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { data } from '../../db';
import { categoryViews } from '../category-views/category-views';
import { Category } from '../interface/category.interface';
import { Recipe } from '../interface/recipe.interface';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  public categoryName = '';
  public categoryId: string;
  public recipesList: Recipe[];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.categoryId = params['cid'];
      const categories: Category[] = data.categories;
      const category = categories.concat(categoryViews).find(category => category.id === this.categoryId);
      this.categoryName = category.name;

      this.recipesList = data.recipes.filter(
        category.selector ?
        category.selector :
        (recipe: Recipe): boolean => recipe.categories.includes(category.id)
      );
    });
  }
}
