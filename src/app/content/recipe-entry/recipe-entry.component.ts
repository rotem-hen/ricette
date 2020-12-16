import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe } from '../interface/recipe.interface';
import { EditModeService } from 'app/shared/edit-mode.service';
import { RecipeEditState } from 'app/shared/interface/recipe-edit-state.interface';
import { DatabaseService } from 'app/shared/database.service';
import { Category } from '../interface/category.interface';
import { DocumentReference } from 'angularfire2/firestore';
import { ToastService } from 'app/shared/toast.service';
import { Button } from 'app/shared/interface/button.inteface';
import { PopupService } from 'app/shared/popup.service';
import { SpecialCategories } from '../category-views/category-views';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.scss']
})
export class RecipeEntryComponent implements OnInit {
  @Input() recipe: Recipe;
  @Input() categoryId: string;
  private categoryList: Category[];
  public categoryColors: string[];
  public errorMessage: string;

  constructor(
    private router: Router,
    public editService: EditModeService,
    private dbService: DatabaseService,
    private toastService: ToastService,
    private popupService: PopupService
  ) {}

  public ngOnInit(): void {
    this.dbService.getCategories().subscribe(c => {
      this.categoryList = c;
      const recipeCategoriesIds: DocumentReference[] = this.recipe.categories;
      const recipeCategories = this.categoryList.filter(c => recipeCategoriesIds.some(cat => cat.id === c.id));
      this.categoryColors = recipeCategories.map(c => c.color);
    });
  }

  public onRecipeClick(): void {
    if (!this.editService.isEditMode) {
      this.router.navigate(['recipes', this.recipe.id]);
    }
  }

  public onEditClick(): void {
    this.router.navigate(['/recipes', this.recipe.id]).then(() => {
      this.editService.toggleEditMode(true);
    });
  }

  public async onDeleteClick(errorToast): Promise<void> {
    const isCategory = !Object.values(SpecialCategories).includes(this.categoryId);
    const confirmButtons: Button[] = [
      {
        text: 'מחיקת המתכון',
        color: '#ecbdc5',
        action: (): Promise<void> => this.deleteRecipe(errorToast)
      }
    ];

    if (isCategory) {
      confirmButtons.unshift({
        text: 'הסרה מהקטגוריה',
        color: '#f3e28f',
        action: (): Promise<void> => this.deleteRecipeFromCategory(this.categoryId, errorToast)
      });
    }

    this.popupService
      .confirm(
        `מחיקת המתכון '${this.recipe.title}'`,
        isCategory ? `בחרו האם להסיר את המתכון מהקטגוריה או למחוק אותו לגמרי` : `האם למחוק את המתכון?`,
        confirmButtons
      )
      .then()
      .catch(() => {
        // User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)
      });
  }

  private async deleteRecipe(errorToast): Promise<void> {
    try {
      await this.dbService.deleteRecipe(this.recipe.id, this.recipe.image);
    } catch (error) {
      this.errorMessage = 'שגיאה במחיקת המתכון. אנא נסו שוב';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }
  }

  private async deleteRecipeFromCategory(categoryId: string, errorToast): Promise<void> {
    if (Object.values(SpecialCategories).includes(categoryId)) {
      this.errorMessage = 'לא ניתן להסיר מהקטגוריה הנוכחית';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }
    try {
      await this.dbService.removeCategoryFromRecipe(this.recipe.id, categoryId);
    } catch (error) {
      this.errorMessage = 'שגיאה בהסרת המתכון מהקטגוריה. אנא נסו שוב';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }
  }
}
