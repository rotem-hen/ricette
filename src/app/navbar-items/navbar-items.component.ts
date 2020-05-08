import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesIds } from '../content/category-views/category-views';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';

@Component({
  selector: 'app-navbar-items',
  templateUrl: './navbar-items.component.html',
  styleUrls: ['./navbar-items.component.css']
})
export class NavbarItemsComponent implements OnInit {
  public selected: number;
  private links = [['categories'], ['categories', CategoriesIds.ALL], ['categories', CategoriesIds.FAVORITES]];

  constructor(private router: Router, private editModeService: EditModeService) {}

  ngOnInit(): void {
    this.selected = 0;
  }

  public onClick(i: number): void {
    this.editModeService.toggleEditMode(false);
    this.selected = i;
    this.router.navigate(this.links[i]);
  }
}
