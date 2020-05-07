import { Component } from '@angular/core';
import { EditModeService } from 'app/app-services/edit-mode-service/edit-mode.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public menuShown = false;

  constructor(private editModeService: EditModeService) {}

  public onMenuClick(): void {
    this.menuShown = !this.menuShown;
  }

  public onEditClick(): void {
    this.editModeService.toggleEditMode();
  }
}
