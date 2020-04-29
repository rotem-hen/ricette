import { Component, OnInit } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews } from '../category-views/category-views';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  public categories: Category[];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.categories = [
      ...data.categories, 
      ...categoryViews.filter(c => !c.hidden)
    ]
  }

  onCategoryClick(category: Category): void {
    this.router.navigate(['/categories', category.id]);
  }
}
