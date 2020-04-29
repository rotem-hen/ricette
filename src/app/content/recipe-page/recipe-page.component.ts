import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { data } from '../../db';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrls: ['./recipe-page.component.css']
})
export class RecipePageComponent implements OnInit {
  public recipe: Recipe;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const recipeId = +this.route.snapshot.paramMap.get('rid');
    this.recipe = data.recipes.find(r => r.id === recipeId);
  }
}
