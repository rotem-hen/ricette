import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from '../db';
import { Recipe } from 'app/content/interface/recipe.interface';
import * as uuid from 'uuid';
import { RecipeModalState } from './interface/recipe-modal-state.interface';
import _ from 'lodash';
import { ToastService } from 'app/toast-service/toast.service';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.css']
})
export class RecipeModalComponent implements OnInit {
  @ViewChild('recipeModal') modalRef: ElementRef;
  public state: RecipeModalState;

  constructor(private modalService: NgbModal, public toastService: ToastService) {}

  public ngOnInit(): void {
    this.state = this.getInitislState();
  }

  public open(state: RecipeModalState): void {
    this.state = state && !_.isEmpty(state) ? state : this.getInitislState();
    this.modalService.open(this.modalRef, { scrollable: true });
  }

  public onOK(modal, errorToast): void {
    modal.close('Ok click');
  }

  /*public onCategoryNameInputChange(event): void {
    this.state.categoryNameInput = event.target.value;
  }

  private isRecipeSelected(id): boolean {
    return this.state.options.find(o => o.recipe.id === id).selected;
  }*/

  private getInitislState(): RecipeModalState {
    return {
      title: '',
      isFavourite: false,
      ingredients: [],
      prep: [],
      options: data.categories.map(category => ({ category, selected: false }))
    };
  }
}