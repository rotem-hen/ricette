import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from '../../db';
import * as uuid from 'uuid';
import { RecipeModalState } from './interface/recipe-modal-state.interface';
import _ from 'lodash';
import { ToastService } from 'app/shared/toast-service/toast.service';
import { EditModeService } from '../edit-mode-service/edit-mode.service';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.css']
})
export class RecipeModalComponent implements OnInit {
  @ViewChild('recipeModal') modalRef: ElementRef;
  public state: RecipeModalState;
  public action = 'הוספת';

  constructor(
    private modalService: NgbModal,
    public toastService: ToastService,
    private editModeService: EditModeService
  ) {}

  public ngOnInit(): void {
    this.state = this.getInitialState();
  }

  public open(state: RecipeModalState): void {
    if (state && !_.isEmpty(state)) {
      this.state = state;
      this.action = 'עריכת';
    }
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

    const categories = this.state.options.filter(o => o.selected).map(o => o.category.id);
    if (this.editModeService.isEditMode) {
      const i = data.recipes.findIndex(r => r.id === this.state.id);
      data.recipes[i] = { ...this.state, categories };
    } else {
      data.recipes.push({ ...this.state, categories });
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
      id: uuid.v4(),
      title: '',
      isFavourite: false,
      ingredients: '',
      prep: '',
      image: '',
      options: data.categories.map(category => ({ category, selected: false }))
    };
  }
}
