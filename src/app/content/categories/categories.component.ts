import { Component, OnInit } from '@angular/core';
import { data } from '../../db';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  public categories = data;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onCategoryClick(category): void {
    this.router.navigate(['/categories', category.id]);
  }

}
