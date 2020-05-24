import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Recipe } from 'app/content/interface/recipe.interface';
import { CategoryModalState } from './interface/category-modal-state.interface';
import { isEmpty, omit } from 'lodash';
import { ToastService } from 'app/shared/toast-service/toast.service';
import { EditModeService } from '../edit-mode-service/edit-mode.service';
import { DatabaseService } from '../database-service/database.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.css']
})
export class CategoryModalComponent {
  @ViewChild('categoryModal') modalRef: ElementRef;
  public state: CategoryModalState;
  public action: string;
  private recipeList: Recipe[];

  constructor(
    private modalService: NgbModal,
    public toastService: ToastService,
    private editModeService: EditModeService,
    private dbService: DatabaseService
  ) {
    this.dbService.getRecipes().subscribe(r => (this.recipeList = r));
  }

  public open(state: CategoryModalState): void {
    this.state = state && !isEmpty(state) ? state : this.getInitialState();
    this.action = state && !isEmpty(state) ? 'עריכת' : 'הוספת';
    this.modalService.open(this.modalRef, {
      scrollable: true,
      beforeDismiss: () => {
        this.toastService.removeAll();
        return true;
      }
    });
  }

  public async onOK(modal, errorToast): Promise<void> {
    modal.close('Ok click');
    if (!this.state.name || !this.state.color) {
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    if (this.editModeService.isEditMode) {
      this.dbService.editCategory(omit(this.state, 'options'));
    } else {
      this.state.id = await this.dbService.addCategory(omit(this.state, 'options'));
    }

    this.recipeList.forEach((recipe: Recipe) => {
      if (this.isRecipeSelected(recipe.id) && !recipe.categories.some(c => c.id === this.state.id)) {
        this.dbService.addCategoryToRecipe(recipe.id, this.state.id);
      } else if (!this.isRecipeSelected(recipe.id)) {
        this.dbService.removeCategoryFromRecipe(recipe.id, this.state.id);
      }
    });

    this.editModeService.toggleEditMode(false);
  }

  public onCategoryNameInputChange(event): void {
    this.state.name = event.target.value;
  }

  private isRecipeSelected(id): boolean {
    return this.state.options.find(o => o.recipe.id === id).selected;
  }

  private getInitialState(): CategoryModalState {
    return {
      name: '',
      color: '',
      options: this.recipeList.map(recipe => ({ recipe, selected: false }))
    };
  }
}
