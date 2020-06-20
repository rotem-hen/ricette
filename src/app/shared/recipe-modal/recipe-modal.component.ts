import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeModalState } from '../interface/recipe-modal-state.interface';
import { omit, isEmpty } from 'lodash';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { DatabaseService } from '../database.service';
import { Category } from 'app/content/interface/category.interface';
import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss']
})
export class RecipeModalComponent implements OnInit, OnDestroy {
  @ViewChild('recipeModal') modalRef: ElementRef;
  public state: RecipeModalState;
  public action: string;
  private categoryList: Category[];
  public errorMessage: string;
  public loading = false;

  private destroy$ = new Subject();

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private router: Router,
    private editModeService: EditModeService,
    private dbService: DatabaseService
  ) {}

  public ngOnInit(): void {
    this.dbService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.categoryList = c));
  }

  public open(state: RecipeModalState): void {
    this.toastService.removeAll();
    this.state = state && !isEmpty(state) ? state : this.getInitialState();
    this.action = state && !isEmpty(state) ? 'עריכת' : 'הוספת';
    this.modalService.open(this.modalRef, {
      scrollable: true,
      backdrop: 'static',
      keyboard: false,
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

    const timeout = new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const id = this.state.id ?? uuid.v4();
      const categoryIds = this.state.options.filter(o => o.selected).map(o => o.category.id);
      const categoryRefs = categoryIds.map(id => this.dbService.getCategoryRef(id));

      const savePromise = this.editModeService.isEditMode
        ? this.dbService.editRecipe(this.state.id, { ...omit(this.state, 'options'), categories: categoryRefs })
        : this.dbService.addRecipe(id, { ...omit(this.state, 'options'), categories: categoryRefs });
      await Promise.race([savePromise, timeout]);
      this.editModeService.toggleEditMode(false);
      this.router.navigate(['/recipes', id]);
      modal.close('Ok click');
    } catch (error) {
      this.errorMessage = 'שגיאה בשמירת המתכון. בדקו את כל השדות';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
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

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
