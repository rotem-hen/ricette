import { Component, OnInit, Input } from '@angular/core';
import { data } from '../../db';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.css']
})
export class RecipeEntryComponent implements OnInit {

  @Input() recipe;
  public categoryColors;
  constructor() { }

  ngOnInit(): void {
    const recipeCategoriesIds: number[] = this.recipe.categories;
    const recipeCategories = data.categories.filter(c => recipeCategoriesIds.includes(c.id));
    this.categoryColors = recipeCategories.map(c => c.color);
  }

}
