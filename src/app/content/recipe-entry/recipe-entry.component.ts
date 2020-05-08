import { Component, OnInit, Input } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';
import { RecipeModalState } from 'app/shared/recipe-modal/interface/recipe-modal-state.interface';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.css']
})
export class RecipeEntryComponent implements OnInit {
  @Input() recipe: Recipe;

  public categoryColors;
  constructor(private router: Router, public editModeService: EditModeService) {}

  ngOnInit(): void {
    const recipeCategoriesIds: string[] = this.recipe.categories;
    const recipeCategories = data.categories.filter(c => recipeCategoriesIds.includes(c.id));
    this.categoryColors = recipeCategories.map(c => c.color);
  }

  onRecipeClick(): void {
    if (!this.editModeService.isEditMode) {
      this.router.navigate(['recipes', this.recipe.id]);
    }
  }

  onEditClick(recipe: Recipe, recipeModal): void {
    const state: RecipeModalState = {
      ...recipe,
      options: data.categories.map(category => {
        return { category, selected: recipe.categories.includes(category.id) };
      })
    };
    recipeModal.open(state);
  }

  onDeleteClick(recipe: Recipe): void {
    data.recipes = data.recipes.filter(r => r.id !== recipe.id);
  }
}
