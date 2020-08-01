import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { RecipeEditState } from '../interface/recipe-edit-state.interface';
import { omit } from 'lodash';
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
import { Button } from '../interface/button.inteface';
import { ConfirmService } from '../confirm.service';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  @Input() state: RecipeEditState;
  @Input() isNew: boolean;
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
    private confirmService: ConfirmService,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.originalState = cloneDeep(this.state);
    this.dbService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.categoryList = c));
  }

  private closeEditMode(): void {
    this.editModeService.toggleEditMode(false);
  }

  public onCancel(): void {
    Object.assign(this.state, this.originalState);
    this.closeEditMode();
    if (this.state.newRecipe) this.location.back();
  }

  public onDeleteClick(errorToast): void {
    const confirmButtons: Button[] = [
      {
        text: 'מחיקת המתכון',
        color: '#ecbdc5',
        action: (): Promise<void> => this.deleteRecipe(errorToast)
      }
    ];

    this.confirmService
      .confirm(`מחיקת המתכון '${this.state.title}'`, `האם למחוק את המתכון?`, confirmButtons)
      .then()
      .catch(() => {
        // User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)
      });
  }

  private async deleteRecipe(errorToast): Promise<void> {
    try {
      await this.dbService.deleteRecipe(this.state.id, this.state.image);
      this.router.navigate(['/categories']);
    } catch (error) {
      this.errorMessage = 'שגיאה במחיקת המתכון. אנא נסו שוב';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }
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
