import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../interface/category.interface';
import { categoryViews, SpecialCategories } from '../category-views/category-views';
import { EditModeService } from 'app/shared/edit-mode.service';
import { CategoryModalState } from 'app/shared/interface/category-modal-state.interface';
import { Recipe } from '../interface/recipe.interface';
import { DatabaseService } from 'app/shared/database.service';
import { ToastService } from 'app/shared/toast.service';
import { ConfirmService } from 'app/shared/confirm.service';
import { Button } from 'app/shared/interface/button.inteface';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from 'app/shared/auth.service';
import initialCategories from './initial-categories.json';
import * as uuid from 'uuid';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  public categoryList: Category[];
  public recipeList: Recipe[];
  public editMode: boolean;
  public SpecialCategories = SpecialCategories;
  public errorMessage: string;
  public showMessages = {
    categoriesMessage: false,
    iosMessage: !this.messageShown('iosMessage') && this.isIos() && !this.isPwa(),
    androidMessage: !this.messageShown('androidMessage') && this.isAndroid() && !this.isPwa()
  };

  private destroy$ = new Subject();

  constructor(
    private router: Router,
    private editModeService: EditModeService,
    private dbService: DatabaseService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private authService: AuthService
  ) {}

  public ngOnInit(): void {
    this.authService.newUser$.pipe(filter(uid => uid !== null)).subscribe((uid: string) => {
      this.createInitialCategories(uid);
      this.showMessages.categoriesMessage = true;
      this.authService.newUser$.next(null);
    });
    const additionalViews = categoryViews.filter(c => !c.hidden);
    this.dbService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.categoryList = c.concat(additionalViews)));
    this.dbService
      .getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => (this.recipeList = r));
  }

  public onCategoryClick(category: Category): void {
    if (!this.editModeService.isEditMode) {
      setTimeout(() => {
        this.router.navigate(['/categories', category.id]);
      }, 200);
    }
  }

  public onEditClick(category: Category, categoryModal): void {
    const state: CategoryModalState = {
      ...category,
      options: this.recipeList.map(recipe => {
        return { recipe, selected: recipe.categories.some(c => c.id === category.id) };
      })
    };
    categoryModal.open(state);
  }

  public async onDeleteClick(category: Category, errorToast): Promise<void> {
    const confirmButtons: Button[] = [
      {
        text: 'מחיקה',
        color: '#ecbdc5',
        action: (): Promise<void> => this.deleteCategory(category, errorToast)
      }
    ];

    this.confirmService
      .confirm(
        `מחיקת הקטגוריה '${category.name}'`,
        `האם אתם בטוחים שאתם רוצים למחוק את הקטגוריה?
        המתכונים שבתוכה לא יימחקו.`,
        confirmButtons
      )
      .then()
      .catch(() => {
        // User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)
      });
  }

  private async deleteCategory(category: Category, errorToast): Promise<void> {
    try {
      await this.dbService.deleteCategory(category.id);
    } catch (error) {
      this.errorMessage = 'שגיאה במחיקת הקטגוריה. אנא נסו שוב';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }
  }

  private async createInitialCategories(uid: string): Promise<void> {
    const promises = initialCategories.map(({ name, color }: Category) =>
      this.dbService.addCategory(uuid.v4(), {
        uid,
        name,
        color
      })
    );

    await Promise.all(promises);
  }

  public gotIt(item: string): void {
    this.showMessages[item] = false;
    localStorage.setItem(item, 'true');
  }

  public messageShown(item: string): boolean {
    return !!localStorage.getItem(item);
  }

  private isIos(): boolean {
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }

  private isAndroid(): boolean {
    return navigator.userAgent.includes('android');
  }

  private isPwa(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
