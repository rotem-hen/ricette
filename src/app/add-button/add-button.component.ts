import { Component } from '@angular/core';
import { EditModeService } from 'app/shared/edit-mode.service';
import * as uuid from 'uuid';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.scss']
})
export class AddButtonComponent {
  public showPopover = false;

  constructor(private editModeService: EditModeService, private router: Router) {}

  public togglePopover(): void {
    this.editModeService.toggleEditMode(false);
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

  public openRecipeEdit(): void {
    const newId = uuid.v4();
    this.router.navigate(['/recipes', newId], {
      state: { currentCategory: this.getCurrentCategory(), isNew: true }
    });
  }

  public openUrlModal(getUrlModal): void {
    getUrlModal.open({});
  }

  private getCurrentCategory(): string {
    const [, type, id] = this.router.url.split('/');
    if (type !== 'categories') {
      return;
    }
    return id;
  }
}
