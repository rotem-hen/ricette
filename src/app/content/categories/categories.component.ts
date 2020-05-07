import { Component, OnInit } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews } from '../category-views/category-views';
import { EditModeService } from 'app/app-services/edit-mode-service/edit-mode.service';

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
    this.categories = [
      ...data.categories, 
      ...categoryViews.filter(c => !c.hidden)
    ]
  }

  onCategoryClick(category: Category): void {
    if (!this.editService.isEditMode) {
      this.router.navigate(['/categories', category.id]);
    }
  }

  onEditClick(category: Category, categoryModal): void {
    categoryModal.open({});
  }

  onDeleteClick(category: Category): void {
    const a = 0;
  }
}
