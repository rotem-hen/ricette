import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from '../db';
import * as uuid from 'uuid';
import { RecipeModalState } from './interface/recipe-modal-state.interface';
import _ from 'lodash';
import { ToastService } from 'app/app-services/toast-service/toast.service';

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
    if (!this.state.title) {
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }
    const id: string = uuid.v4();
    const categories = this.state.options.filter(o => o.selected).map(o => o.category.id);
    data.recipes.push({
      id,
      categories,
      title: this.state.title,
      isFavourite: this.state.isFavourite,
      ingredients: this.state.ingredients,
      prep: this.state.prep,
      image: this.state.image
    });
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
  private isRecipeSelected(id): boolean {
    return this.state.options.find(o => o.category.id === id).selected;
  }

  private getInitislState(): RecipeModalState {
    return {
      title: '',
      isFavourite: false,
      ingredients: '',
      prep: '',
      image: '',
      options: data.categories.map(category => ({ category, selected: false }))
    };
  }

  //private 
}
