import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeEditState } from '../interface/recipe-edit-state.interface';
import { omit, isEmpty } from 'lodash';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { DatabaseService } from '../database.service';
import { Category } from 'app/content/interface/category.interface';
import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  @Input() state: RecipeEditState;
  private originalState: RecipeEditState;
  public action: string;
  private categoryList: Category[];
  public errorMessage: string;
  public loading = false;
  private destroy$ = new Subject();

  constructor(
    private toastService: ToastService,
    private router: Router,
    private editModeService: EditModeService,
    private dbService: DatabaseService,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.originalState = cloneDeep(this.state);
    this.dbService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.categoryList = c));
  }

  // public open(state: RecipeEditState): void {
  //   this.toastService.removeAll();
  //   this.state = state && !isEmpty(state) ? state : this.getInitialState();
  //   this.action = state && !isEmpty(state) ? 'עריכת' : 'הוספת';
  //   this.modalService.open(this.modalRef, {
  //     scrollable: true,
  //     backdrop: 'static',
  //     keyboard: false,
  //     beforeDismiss: () => {
  //       this.toastService.removeAll();
  //       return true;
  //     }
  //   });
  // }
  private closeEditMode(): void {
    this.editModeService.toggleEditMode(false);
  }

  public onCancel(): void {
    Object.assign(this.state, this.originalState);
    this.closeEditMode();
    if (this.state.newRecipe) this.location.back();
  }

  public async onOK(errorToast): Promise<void> {
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

      const savePromise = this.state.newRecipe
        ? this.dbService.addRecipe(id, { ...omit(this.state, 'options'), categories: categoryRefs })
        : this.dbService.editRecipe(this.state.id, { ...omit(this.state, 'options'), categories: categoryRefs });
      await Promise.race([savePromise, timeout]);
      this.editModeService.toggleEditMode(false);
      this.router.navigate(['/recipes', id]);
      this.closeEditMode();
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

  private getInitialState(): RecipeEditState {
    return {
      title: '',
      isFavourite: false,
      ingredients: '',
      prep: '',
      image: '',
      newRecipe: false,
      options: this.categoryList.map(category => ({ category, selected: false }))
    };
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
