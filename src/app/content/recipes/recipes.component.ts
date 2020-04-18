import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { data } from '../../db';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

  public categoryName = '';
  public recipesList = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    const entry = data.find(category => category.id === +param);
    this.categoryName = entry.name;

    this.recipesList = entry.recipes;
  }

  onBack(): void {
    this.router.navigate(['']);
  }
}
