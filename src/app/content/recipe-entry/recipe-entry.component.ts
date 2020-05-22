import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';
import { RecipeModalState } from 'app/shared/recipe-modal/interface/recipe-modal-state.interface';
import { DatabaseService } from 'app/shared/database-service/database.service';
import { Category } from '../interface/category.interface';
import { DocumentReference } from 'angularfire2/firestore';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.css']
})
export class RecipeEntryComponent {
  @Input() recipe: Recipe;
  private categoryList: Category[];
  public categoryColors: string[];

  constructor(private router: Router, public editService: EditModeService, private dbService: DatabaseService) {
    this.dbService.getCategories().subscribe(c => {
      this.categoryList = c;
      const recipeCategoriesIds: DocumentReference[] = this.recipe.categories;
      const recipeCategories = this.categoryList.filter(c => recipeCategoriesIds.some(cat => cat.id === c.id));
      this.categoryColors = recipeCategories.map(c => c.color);
    });
  }

  onRecipeClick(): void {
    if (!this.editService.isEditMode) {
      this.router.navigate(['recipes', this.recipe.id]);
    }
  }

  onEditClick(recipeModal): void {
    const state: RecipeModalState = {
      ...this.recipe,
      options: this.categoryList.map(category => {
        return { category, selected: this.recipe.categories.some(c => c.id === category.id) };
      })
    };
    recipeModal.open(state);
  }

  onDeleteClick(): void {
    if (confirm(`אתם בטוחים שתרצו למחוק את המתכון ${this.recipe.title}?`)) {
      this.dbService.deleteRecipe(this.recipe.id);
    }
  }
}
