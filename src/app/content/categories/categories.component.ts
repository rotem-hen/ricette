import { Component } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  public categories = data.categories;

  constructor(private router: Router) {}

  onCategoryClick(category): void {
    this.router.navigate(['/categories', category.id]);
  }
}
