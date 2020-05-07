import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from '../../db';
import { Recipe } from 'app/content/interface/recipe.interface';
import * as uuid from 'uuid';
import { CategoryModalState } from './interface/category-modal-state.interface';
import _ from 'lodash';
import { ToastService } from 'app/shared/toast-service/toast.service';
import { EditModeService } from '../edit-mode-service/edit-mode.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.css']
})
export class CategoryModalComponent implements OnInit {
  @ViewChild('categoryModal') modalRef: ElementRef;
  public state: CategoryModalState;

  constructor(
    private modalService: NgbModal,
    public toastService: ToastService,
    private editModeService: EditModeService) {}

  public ngOnInit(): void {
    this.state = this.getInitialState();
  }

  public open(state: CategoryModalState): void {
    this.state = state && !_.isEmpty(state) ? state : this.getInitialState();
    this.modalService.open(this.modalRef, {
      scrollable: true,
      beforeDismiss: () => {
        this.toastService.removeAll();
        return true;
      }
    });
  }

  public onOK(modal, errorToast): void {
    if (!this.state.name || !this.state.color) {
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    if (this.editModeService.isEditMode) {
      const i = data.categories.findIndex(c => c.id === this.state.id);
      data.categories[i] = this.state;
    } else {
      data.categories.push(this.state);
    }
    data.recipes.forEach((recipe: Recipe) => {
      if (this.isRecipeSelected(recipe.id) && !recipe.categories.includes(this.state.id)) {
        recipe.categories.push(this.state.id);
      } else if (!this.isRecipeSelected(recipe.id)) {
        recipe.categories = recipe.categories.filter(c => c !== this.state.id);
      }
    });
    modal.close('Ok click');
  }

  public onCategoryNameInputChange(event): void {
    this.state.name = event.target.value;
  }

  private isRecipeSelected(id): boolean {
    return this.state.options.find(o => o.recipe.id === id).selected;
  }

  private getInitialState(): CategoryModalState {
    return {
      id: uuid.v4(),
      name: '',
      color: '',
      options: data.recipes.map(recipe => ({ recipe, selected: false }))
    };
  }
}
