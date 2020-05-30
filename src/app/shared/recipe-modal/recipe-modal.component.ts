import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeModalState } from './interface/recipe-modal-state.interface';
import { omit, isEmpty } from 'lodash';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { DatabaseService } from '../database.service';
import { Category } from 'app/content/interface/category.interface';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss']
})
export class RecipeModalComponent implements OnInit {
  @ViewChild('recipeModal') modalRef: ElementRef;
  public state: RecipeModalState;
  public action = 'הוספת';
  private categoryList: Category[];
  public errorMessage: string;
  public loading = false;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private editModeService: EditModeService,
    private dbService: DatabaseService
  ) {}

  public ngOnInit(): void {
    this.dbService.getCategories().subscribe(c => (this.categoryList = c));
  }

  public open(state: RecipeModalState): void {
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
    if (!this.state.title) {
      this.errorMessage = 'אנא בחרו שם למתכון';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    this.loading = true;

    try {
      const categoryIds = this.state.options.filter(o => o.selected).map(o => o.category.id);
      const categoryRefs = categoryIds.map(id => this.dbService.getCategoryRef(id));
      if (this.editModeService.isEditMode) {
        await this.dbService.editRecipe(this.state.id, { ...omit(this.state, 'options'), categories: categoryRefs })
      } else {
        await this.dbService.addRecipe({ ...omit(this.state, 'options'), categories: categoryRefs });
      }
      this.editModeService.toggleEditMode(false);
      modal.close('Ok click');
    } catch (error) {
      this.errorMessage = 'שגיאה בשמירת המתכון. בדקו את כל השדות';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 8000 });
    }

    this.loading = false;
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
