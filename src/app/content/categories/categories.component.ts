import { Component, OnInit } from '@angular/core';
import { data } from '../../db';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  public categories = data;

  constructor() { }

  ngOnInit(): void {
  }

}
