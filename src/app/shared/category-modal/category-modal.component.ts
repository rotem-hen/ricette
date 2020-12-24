import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Recipe } from 'app/content/interface/recipe.interface';
import { CategoryModalState } from '../interface/category-modal-state.interface';
import { isEmpty, omit } from 'lodash';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { DatabaseService } from '../database.service';
import * as uuid from 'uuid';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { PresetColors } from 'app/shared/preset-colors';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent implements OnInit, OnDestroy {
  @ViewChild('categoryModal') modalRef: ElementRef;
  public state: CategoryModalState;
  public action: string;
  private recipeList: Recipe[];
  public errorMessage: string;
  public loading = false;
  public NAME_MAX_LENGTH = 25;
  public presetColors = PresetColors;

  get remainingChars(): number {
    return this.NAME_MAX_LENGTH - this.state.name.length;
  }

  private destroy$ = new Subject();

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private editModeService: EditModeService,
    private dbService: DatabaseService,
    private analytics: AngularFireAnalytics
  ) {}

  public ngOnInit(): void {
    this.dbService
      .getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => (this.recipeList = r));
  }

  public open(state: CategoryModalState): void {
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
    if (!this.state.name || !this.state.color) {
      this.errorMessage = 'אנא בחרו שם וצבע לקטגוריה';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    this.loading = true;

    const timeout = new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const id = uuid.v4();
      const savePromise = this.editModeService.isEditMode
        ? this.dbService.editCategory(omit(this.state, 'options'))
        : this.dbService.addCategory(id, omit(this.state, 'options')).then(() => (this.state.id = id));

      await Promise.race([savePromise, timeout]);

      this.recipeList.forEach((recipe: Recipe) => {
        if (this.isRecipeSelected(recipe.id) && !recipe.categories.some(c => c.id === this.state.id)) {
          this.dbService.addCategoryToRecipe(recipe.id, this.state.id);
        } else if (!this.isRecipeSelected(recipe.id)) {
          this.dbService.removeCategoryFromRecipe(recipe.id, this.state.id);
        }
      });
      this.analytics.logEvent('category_edit', { name: this.state.name, isEdit: this.editModeService.isEditMode });
      this.editModeService.toggleEditMode(false);
      modal.close('Ok click');
    } catch (error) {
      this.analytics.logEvent('error', { type: 'category_edit', message: error.message });
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

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
