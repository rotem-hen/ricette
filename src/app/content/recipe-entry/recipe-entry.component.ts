import { Component, OnInit, Input } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.css']
})
export class RecipeEntryComponent implements OnInit {
  @Input() recipe: Recipe;

  public categoryColors;
  constructor(private router: Router) {}

  ngOnInit(): void {
    const recipeCategoriesIds: number[] = this.recipe.categories;
    const recipeCategories = data.categories.filter(c => recipeCategoriesIds.includes(c.id));
    this.categoryColors = recipeCategories.map(c => c.color);
  }

  onRecipeClick(): void {
    this.router.navigate(['recipes', this.recipe.id]);
  }
}
