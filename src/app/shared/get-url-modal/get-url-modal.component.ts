import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'app/shared/toast.service';
import { EditModeService } from '../edit-mode.service';
import { RecipeEditState } from '../interface/recipe-edit-state.interface';
import { Subject } from 'rxjs';
import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { AngularFireAnalytics } from '@angular/fire/analytics';

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
      // let response = await fetch('https://smartfreshbear.com/food/api', {
      //   method: 'GET',
      //   headers: {
      //     'SFB-TOKEN': 'fibonacci_heap_2022',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     url: 'https://www.mako.co.il/food-cooking_magazine/keren_agam_bakery/Recipe-21c53f8593fa771026.htm'
      //   })
      // });
      // response = await response.json();
      // console.log(response);

      const recipeState: RecipeEditState = {
        title: 'לצורך כריך',
        isFavourite: false,
        ingredients: 'ing\ning2\ning3',
        prep: 'do1\ndo2',
        link: 'https://the_link.com',
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
