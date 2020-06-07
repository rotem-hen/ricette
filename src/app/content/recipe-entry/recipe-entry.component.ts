import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode.service';
import { RecipeModalState } from 'app/shared/interface/recipe-modal-state.interface';
import { DatabaseService } from 'app/shared/database.service';
import { Category } from '../interface/category.interface';
import { DocumentReference } from 'angularfire2/firestore';
import { ToastService } from 'app/shared/toast.service';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.scss']
})
export class RecipeEntryComponent implements OnInit {
  @Input() recipe: Recipe;
  private categoryList: Category[];
  public categoryColors: string[];
  public errorMessage: string;
  public imageSrc: string;

  constructor(
    private router: Router,
    public editService: EditModeService,
    private dbService: DatabaseService,
    private toastService: ToastService
  ) {}

  public ngOnInit(): void {
    this.dbService.getCategories().subscribe(c => {
      this.categoryList = c;
      const recipeCategoriesIds: DocumentReference[] = this.recipe.categories;
      const recipeCategories = this.categoryList.filter(c => recipeCategoriesIds.some(cat => cat.id === c.id));
      this.categoryColors = recipeCategories.map(c => c.color);
    });

    this.imageSrc = this.recipe.image ? this.recipe.image : './assets/food.jpg';
  }

  public onRecipeClick(): void {
    if (!this.editService.isEditMode) {
      this.router.navigate(['recipes', this.recipe.id]);
    }
  }

  public onEditClick(recipeModal): void {
    const state: RecipeModalState = {
      ...this.recipe,
      options: this.categoryList.map(category => {
        return { category, selected: this.recipe.categories.some(c => c.id === category.id) };
      })
    };
    recipeModal.open(state);
  }

  public async onDeleteClick(errorToast): Promise<void> {
    if (confirm(`אתם בטוחים שתרצו למחוק את המתכון ${this.recipe.title}?`)) {
      try {
        await this.dbService.deleteRecipe(this.recipe.id);
      } catch (error) {
        this.errorMessage = 'שגיאה במחיקת המתכון. אנא נסו שוב';
        this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 8000 });
      }
    }
  }
}
