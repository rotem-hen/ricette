import { Component } from '@angular/core';
import { EditModeService } from 'app/shared/edit-mode.service';
import { Router } from '@angular/router';
import { SpecialCategories } from '../content/category-views/category-views';
import { SearchService } from 'app/shared/search.service';
import { AuthService } from 'app/shared/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  public collapsed = true;
  public navButtons = [
    {
      text: 'קטגוריות',
      onClick: (): void => this.onNavButtonClick(['categories']),
      iconClasses: 'fas fa-th-large'
    },
    {
      text: 'כל המתכונים',
      onClick: (): void => this.onNavButtonClick(['categories', SpecialCategories.ALL]),
      iconClasses: 'fas fa-list-ul'
    },
    {
      text: 'מועדפים',
      onClick: (): void => this.onNavButtonClick(['categories', SpecialCategories.FAVORITES]),
      iconClasses: 'far fa-star'
    }
  ];

  constructor(
    public router: Router,
    public editModeService: EditModeService,
    public searchService: SearchService,
    public authService: AuthService
  ) {}

  public onMenuClick(): void {
    this.editModeService.toggleEditMode(false);
  }

  public onEditClick(): void {
    const [host, type, id] = this.router.url.split('/');
    if (type === 'recipes' && this.editModeService.isEditMode) return;
    this.editModeService.toggleEditMode();
  }

  public searchInputClick(): void {
    this.editModeService.toggleEditMode(false);
  }

  public onNavButtonClick(link: string[]): void {
    this.editModeService.toggleEditMode(false);
    this.collapsed = true;
    this.router.navigate(link);
  }

  public onSearchInputChange(event): void {
    this.searchService.setSearchTerm(event.target.value);
    if (this.router.url !== `/categories/${SpecialCategories.SEARCH_RESULTS}`) {
      this.router.navigate(['/categories', SpecialCategories.SEARCH_RESULTS]);
    }
  }
}
