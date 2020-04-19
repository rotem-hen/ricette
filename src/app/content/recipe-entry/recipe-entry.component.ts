import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-entry',
  templateUrl: './recipe-entry.component.html',
  styleUrls: ['./recipe-entry.component.css']
})
export class RecipeEntryComponent implements OnInit {

  @Input() recipe;

  constructor() { }

  ngOnInit(): void {
  }

}
