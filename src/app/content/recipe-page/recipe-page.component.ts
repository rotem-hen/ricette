import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrls: ['./recipe-page.component.css']
})
export class RecipePageComponent implements OnInit {
  public recipeId: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.recipeId = +this.route.snapshot.paramMap.get('rid');
  }
}
