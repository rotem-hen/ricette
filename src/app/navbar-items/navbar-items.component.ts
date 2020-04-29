import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesTypes } from '../enum/categories-types.enum';

@Component({
  selector: 'app-navbar-items',
  templateUrl: './navbar-items.component.html',
  styleUrls: ['./navbar-items.component.css']
})
export class NavbarItemsComponent implements OnInit {
  public selected: number;
  private links = [['categories'], ['categories', CategoriesTypes.ALL], ['categories', CategoriesTypes.FAVORITES]];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.selected = 0;
  }

  public onClick(i: number): void {
    this.selected = i;
    this.router.navigate(this.links[i]);
  }
}
