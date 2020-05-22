import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeModalState } from './interface/recipe-modal-state.interface';
import _ from 'lodash';
import { ToastService } from 'app/shared/toast-service/toast.service';
import { EditModeService } from '../edit-mode-service/edit-mode.service';
import { DatabaseService } from '../database-service/database.service';
import { Category } from 'app/content/interface/category.interface';
import { Recipe } from 'app/content/interface/recipe.interface';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.css']
})
export class RecipeModalComponent {
  @ViewChild('recipeModal') modalRef: ElementRef;
  public state: RecipeModalState;
  public action = 'הוספת';
  private categoryList: Category[];
  private recipeList: Recipe[];

  constructor(
    private modalService: NgbModal,
    public toastService: ToastService,
    private editModeService: EditModeService,
    private dbService: DatabaseService
  ) {
    this.dbService.getCategories().subscribe(c => (this.categoryList = c));
    this.dbService.getRecipes().subscribe(r => (this.recipeList = r));
  }

  public open(state: RecipeModalState): void {
    this.state = state && !_.isEmpty(state) ? state : this.getInitialState();
    this.action = state && !_.isEmpty(state) ? 'עריכת' : 'הוספת';
    this.modalService.open(this.modalRef, {
      scrollable: true,
      beforeDismiss: () => {
        this.toastService.removeAll();
        return true;
      }
    });
  }

  public onOK(modal, errorToast): void {
    if (!this.state.title) {
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    const categories = this.state.options.filter(o => o.selected);
    if (this.editModeService.isEditMode) {
      this.dbService.editRecipe(this.state.id, { ..._.omit(this.state, 'options') });
    } else {
      this.dbService.addRecipe({ ..._.omit(this.state, 'options'), categories });
    }
    this.editModeService.toggleEditMode(false);
    modal.close('Ok click');
  }

  public onRecipeNameInputChange(event): void {
    this.state.title = event.target.value;
  }

  public onIngredientsInputChange(event): void {
    this.state.ingredients = event.target.value;
  }

  public onPrepInputChange(event): void {
    this.state.prep = event.target.value;
  }

  public onSelect(image): void {
    this.state.image = image;
  }

  private getInitialState(): RecipeModalState {
    return {
      title: '',
      isFavourite: false,
      ingredients: '',
      prep: '',
      image: '',
      options: this.categoryList.map(category => ({ category, selected: false }))
    };
  }
}
