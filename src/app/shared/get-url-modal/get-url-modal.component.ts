import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { RecipeEditState } from '../interface/recipe-edit-state.interface';
import { Subject } from 'rxjs';
import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { AngularFireAnalytics } from '@angular/fire/analytics';

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 20000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(id);
  return response;
}

@Component({
  selector: 'app-get-url-modal',
  templateUrl: './get-url-modal.component.html',
  styleUrls: ['./get-url-modal.component.scss']
})
export class GetUrlModalComponent implements OnDestroy {
  @ViewChild('getUrlModal') modalRef: ElementRef;
  public url: string;
  public errorMessage: string;
  public loading = false;

  private destroy$ = new Subject();

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private editModeService: EditModeService,
    private router: Router,
    private analytics: AngularFireAnalytics
  ) {}

  public open(): void {
    this.url = '';
    this.toastService.removeAll();
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
    if (!this.url) {
      this.errorMessage = 'אנא מלאו כתובת אתר';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }

    this.loading = true;

    try {
      const responseRaw = await fetchWithTimeout(`https://smartfreshbear.com/food/api?url=${this.url}`, {
        method: 'GET',
        headers: {
          SFB: 'fibonacci_heap_2022',
          'Content-Type': 'application/json'
        }
      });

      const response: {
        title: string;
        ingredients: string[];
        instructions: string[];
        url: string;
      } = await responseRaw.json();

      const recipeState: RecipeEditState = {
        title: response.title,
        isFavourite: false,
        ingredients: response.ingredients.join('\n'),
        prep: response.instructions.join('\n'),
        link: response.url,
        duration: null,
        quantity: null,
        image: null,
        newRecipe: true,
        options: []
      };
      this.openRecipeEdit(recipeState);

      this.editModeService.toggleEditMode(false);
      modal.close('Ok click');
    } catch (error) {
      this.analytics.logEvent('error', { type: 'recipe_from_url', message: error.message });
      this.errorMessage = 'שגיאה בייבוא המתכון. אנא בדקו את הכתובת או העתיקו ידנית';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }

    this.loading = false;
  }

  public onUrlInputChange(event): void {
    this.url = event.target.value;
  }

  private openRecipeEdit(recipeState: RecipeEditState): void {
    const newId = uuid.v4();
    this.router.navigate(['/recipes', newId], {
      state: { recipeState, isNew: true }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
