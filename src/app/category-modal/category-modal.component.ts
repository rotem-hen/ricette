import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from '../db';
import { Recipe } from 'app/content/interface/recipe.interface';
import * as uuid from 'uuid';
import { CategoryModalState } from './interface/category-modal-state.interface';
import _ from 'lodash';
import { ToastService } from 'app/app-services/toast-service/toast.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.css']
})
export class CategoryModalComponent implements OnInit {
  @ViewChild('categoryModal') modalRef: ElementRef;
  public state: CategoryModalState;

  constructor(private modalService: NgbModal, public toastService: ToastService) {}

  public ngOnInit(): void {
    this.state = this.getInitislState();
  }

  public open(state: CategoryModalState): void {
    this.state = state && !_.isEmpty(state) ? state : this.getInitislState();
    this.modalService.open(this.modalRef, { scrollable: true });
  }

  public onOK(modal, errorToast): void {
    if (!this.state.categoryNameInput || !this.state.color) {
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }
    const id: string = uuid.v4();
    data.categories.push({ id, name: this.state.categoryNameInput, color: this.state.color });
    data.recipes.forEach((recipe: Recipe) => {
      if (this.isRecipeSelected(recipe.id)) {
        recipe.categories.push(id);
      }
    });
    modal.close('Ok click');
  }

  public onCategoryNameInputChange(event): void {
    this.state.categoryNameInput = event.target.value;
  }

  private isRecipeSelected(id): boolean {
    return this.state.options.find(o => o.recipe.id === id).selected;
  }

  private getInitislState(): CategoryModalState {
    return {
      categoryNameInput: '',
      color: '',
      options: data.recipes.map(recipe => ({ recipe, selected: false }))
    };
  }
}
