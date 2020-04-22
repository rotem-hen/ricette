import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { data } from '../../db';

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
    this.categoryId = +this.route.snapshot.paramMap.get('cid');
    const category = data.categories.find(category => category.id === this.categoryId);
    this.categoryName = category.name;

    this.recipesList = !this.categoryId
      ? data.recipes.filter(recipe => !recipe.categories.length)
      : data.recipes.filter(recipe => recipe.categories.includes(category.id));
  }
}
