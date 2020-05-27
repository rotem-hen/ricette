import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews, CategoriesIds } from '../category-views/category-views';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';
import { CategoryModalState } from 'app/shared/category-modal/interface/category-modal-state.interface';
import { Recipe } from '../interface/recipe.interface';
import { DatabaseService } from 'app/shared/database-service/database.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  public categoryList: Category[];
  public recipeList: Recipe[];
  public editMode: boolean;
  public CategoriesIds;

  constructor(private router: Router, private editModeService: EditModeService, private dbService: DatabaseService) {}

  public ngOnInit(): void {
    this.CategoriesIds = CategoriesIds;
    const additionalViews = categoryViews.filter(c => !c.hidden);
    this.dbService.getCategories().subscribe(c => (this.categoryList = c.concat(additionalViews)));
    this.dbService.getRecipes().subscribe(r => (this.recipeList = r));
  }

  public onCategoryClick(category: Category): void {
    if (!this.editModeService.isEditMode) {
      this.router.navigate(['/categories', category.id]);
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

  public onDeleteClick(category: Category): void {
    if (confirm(`אתם בטוחים שתרצו למחוק את הקטגוריה ${category.name}?`)) {
      this.dbService.deleteCategory(category.id);
    }
  }
}
