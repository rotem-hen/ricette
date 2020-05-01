import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from '../../db';
import { Recipe } from 'app/content/interface/recipe.interface';

@Component({
  selector: 'app-new-category-modal',
  templateUrl: './new-category-modal.component.html',
  styleUrls: ['./new-category-modal.component.css']
})
export class NewCategoryModalComponent implements OnInit {
  @ViewChild('newCategoryModal') modalRef: ElementRef;
  public categoryNameInput: string;

  options: {
    recipe: Recipe;
    selected: boolean;
  }[];
  constructor(private modalService: NgbModal) {}

  public ngOnInit(): void {
    this.options = data.recipes.map(recipe => ({ recipe, selected: false }));
  }

  public open(): void {
    this.modalService.open(this.modalRef, { scrollable: true });
  }

  public onOK(modal, categoryColor): void {
    modal.close('Ok click');
    const id = 200;
    data.categories.push({ id, name: this.categoryNameInput, color: categoryColor });
    data.recipes.forEach((recipe: Recipe) => {
      if (this.isRecipeSelected(recipe.id)) {
        recipe.categories.push(id);
      }
    });
  }

  public onCategoryNameInputChange(event): void {
    this.categoryNameInput = event.target.value;
  }

  private isRecipeSelected(id): boolean {
    return this.options.find(o => o.recipe.id === id).selected;
  }
}
