import { Component, OnInit } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews, CategoriesIds } from '../category-views/category-views';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';
import { CategoryModalState } from 'app/shared/category-modal/interface/category-modal-state.interface';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  public categories: Category[];
  public editMode: boolean;
  public CategoriesIds;

  constructor(private router: Router, private editModeService: EditModeService) {}

  ngOnInit(): void {
    this.CategoriesIds = CategoriesIds;
    this.categories = [...data.categories, ...categoryViews.filter(c => !c.hidden)];
  }

  onCategoryClick(category: Category): void {
    if (!this.editModeService.isEditMode) {
      this.router.navigate(['/categories', category.id]);
    }
  }

  onEditClick(category: Category, categoryModal): void {
    const state: CategoryModalState = {
      ...category,
      options: data.recipes.map(recipe => {
        return { recipe, selected: recipe.categories.includes(category.id) };
      })
    };
    categoryModal.open(state);
  }

  onDeleteClick(category: Category): void {
    data.categories = data.categories.filter(c => c.id !== category.id);
    data.recipes = data.recipes.map(r => {
      const newCategories = r.categories.filter(c => c !== category.id);
      return { ...r, categories: newCategories };
    });
  }
}
