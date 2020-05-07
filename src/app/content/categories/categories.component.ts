import { Component, OnInit } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews } from '../category-views/category-views';
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

  constructor(private router: Router, private editService: EditModeService) {}

  ngOnInit(): void {
    this.categories = [...data.categories, ...categoryViews.filter(c => !c.hidden)];
  }

  onCategoryClick(category: Category): void {
    if (!this.editService.isEditMode) {
      this.router.navigate(['/categories', category.id]);
    }
  }

  onEditClick(category: Category, categoryModal): void {
    const state: CategoryModalState = {
      id: category.id,
      name: category.name,
      color: category.color,
      options: data.recipes.map(recipe => {
        return { recipe, selected: recipe.categories.includes(category.id) };
      })
    };
    categoryModal.open(state);
  }

  onDeleteClick(category: Category): void {
    data.categories = data.categories.filter(c => c.id !== category.id);
  }
}
