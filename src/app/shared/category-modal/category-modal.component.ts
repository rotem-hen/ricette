import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Recipe } from 'app/content/interface/recipe.interface';
import { CategoryModalState } from '../interface/category-modal-state.interface';
import { isEmpty, omit } from 'lodash';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent implements OnInit {
  @ViewChild('categoryModal') modalRef: ElementRef;
  public state: CategoryModalState;
  public action: string;
  private recipeList: Recipe[];
  public errorMessage: string;
  public loading = false;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private editModeService: EditModeService,
    private dbService: DatabaseService
  ) {}

  public ngOnInit(): void {
    this.dbService.getRecipes().subscribe(r => (this.recipeList = r));
  }

  public open(state: CategoryModalState): void {
    this.toastService.removeAll();
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
    if (!this.state.name || !this.state.color) {
      this.errorMessage = 'אנא בחרו שם וצבע לקטגוריה';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    this.loading = true;

    try {
      if (this.editModeService.isEditMode) {
        await this.dbService.editCategory(omit(this.state, 'options'));
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
      modal.close('Ok click');
    } catch (error) {
      this.errorMessage = 'שגיאה בשמירת הקטגוריה. בדקו את כל השדות';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }

    this.loading = false;
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
