import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews, CategoriesIds } from '../category-views/category-views';
import { EditModeService } from 'app/shared/edit-mode.service';
import { CategoryModalState } from 'app/shared/category-modal/interface/category-modal-state.interface';
import { Recipe } from '../interface/recipe.interface';
import { DatabaseService } from 'app/shared/database.service';
import { ToastService } from 'app/shared/toast.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  public categoryList: Category[];
  public recipeList: Recipe[];
  public editMode: boolean;
  public CategoriesIds = CategoriesIds;
  public errorMessage: string;

  constructor(private router: Router, private editModeService: EditModeService, private dbService: DatabaseService, private toastService: ToastService) {}

  public ngOnInit(): void {
    const additionalViews = categoryViews.filter(c => !c.hidden);
    this.dbService.getCategories().subscribe(c => (this.categoryList = c.concat(additionalViews)));
    this.dbService.getRecipes().subscribe(r => (this.recipeList = r));
  }

  public onCategoryClick(category: Category): void {
    if (!this.editModeService.isEditMode) {
      setTimeout(() => {
        this.router.navigate(['/categories', category.id]);
      }, 200);
    }
  }

  public onEditClick(category: Category, categoryModal): void {
    const state: CategoryModalState = {
      ...category,
      options: this.recipeList.map(recipe => {
        return { recipe, selected: recipe.categories.some(c => c.id === category.id) };
      })
    };
    categoryModal.open(state);
  }

  public async onDeleteClick(category: Category, errorToast): Promise<void> {
    if (confirm(`אתם בטוחים שתרצו למחוק את הקטגוריה ${category.name}?`)) {
      try {
        await this.dbService.deleteCategory(category.id);
      } catch (error) {
        this.errorMessage = 'שגיאה במחיקת הקטגוריה. אנא נסו שוב';
        this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 8000 });
      }
    }
  }
}
