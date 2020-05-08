import { Component } from '@angular/core';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public menuShown = false;

  constructor(private editModeService: EditModeService) {}

  public onMenuClick(): void {
    this.editModeService.toggleEditMode(false);
    this.menuShown = !this.menuShown;
  }

  public onEditClick(): void {
    this.editModeService.toggleEditMode();
  }

  public searchInputClick(): void {
    this.editModeService.toggleEditMode(false);
  }
}