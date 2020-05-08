import { Component } from '@angular/core';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';

@Component({
  selector: 'app-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.css']
})
export class AddButtonComponent {
  public showPopover = false;

  constructor(public editModeService: EditModeService) {}

  public togglePopover(): void {
    if (this.editModeService.isEditMode) return;
    this.showPopover = !this.showPopover;
    if (this.showPopover) {
      document.addEventListener('click', this.onOutsideClick);
    } else {
      document.removeEventListener('click', this.onOutsideClick);
    }
  }

  private onOutsideClick = (e): void => {
    if (e.target.offsetParent?.nodeName?.toLowerCase() === 'app-add-button') return;
    this.showPopover = !this.showPopover;
    document.removeEventListener('click', this.onOutsideClick);
  };

  public openCategoryModal(categoryModal): void {
    categoryModal.open({});
  }

  public openRecipeModal(recipeModal): void {
    recipeModal.open({});
  }
}
