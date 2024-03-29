import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../toast.service';
import { DatabaseService } from '../database.service';
import * as uuid from 'uuid';
import { StorageService } from '../storage.service';
import { debounce } from 'lodash-es';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-recipe-image-modal',
  templateUrl: './recipe-image-modal.component.html',
  styleUrls: ['./recipe-image-modal.component.scss']
})
export class RecipeImageModalComponent {
  @Input() existingImgDownloadUrl: string;
  @ViewChild('recipeImageModal') modalRef: ElementRef;
  public errorMessage: string;
  public loading = false;
  private imageStr: string;
  private recipeId: string;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private dbService: DatabaseService,
    private storageService: StorageService,
    private analytics: AngularFireAnalytics
  ) {}

  public open(recipeId: string): void {
    this.recipeId = recipeId;
    this.imageStr = null;
    document.addEventListener('crop', this.startCrop);
    this.modalService.open(this.modalRef, {
      scrollable: true,
      beforeDismiss: () => {
        this.toastService.removeAll();
        return true;
      }
    });
  }

  public async onOK(modal: NgbModalRef, errorToast): Promise<void> {
    this.loading = true;

    try {
      if (this.existingImgDownloadUrl) {
        await this.storageService.removeImage(this.existingImgDownloadUrl);
      }
      const imageBlob = await (await fetch(this.imageStr)).blob();
      const fileName = `recipeImages/${uuid.v4()}`;
      await this.storageService.upload(fileName, imageBlob);
      const url = await this.storageService.getDownloadUrlFromLink(fileName);
      await this.dbService.editRecipeImage(this.recipeId, url);

      document.removeEventListener('crop', this.startCrop);
      this.analytics.logEvent('recipe_image_edit', { recipeId: this.recipeId });
      modal.close('Ok click');
    } catch (error) {
      this.analytics.logEvent('error', { type: 'recipe_image_edit', message: error.message });
      this.errorMessage = 'שגיאה בשמירת התמונה';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }

    this.loading = false;
  }

  public async onDeleteImage(modal: NgbModalRef, errorToast): Promise<void> {
    this.loading = true;

    try {
      await this.storageService.removeImage(this.existingImgDownloadUrl);
      await this.dbService.editRecipeImage(this.recipeId, '');
      this.analytics.logEvent('recipe_image_delete', { recipeId: this.recipeId });
      modal.close('Ok click');
    } catch (error) {
      this.analytics.logEvent('error', { type: 'recipe_image_delete', message: error.message });
      this.errorMessage = 'שגיאה בהסרת התמונה';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 4000 });
    }

    this.loading = false;
  }
  public onSelect(image: string): void {
    this.imageStr = image;
  }

  public reset(): void {
    this.imageStr = null;
  }

  startCrop = debounce(
    () => {
      this.imageStr = null;
    },
    50,
    { leading: true }
  );
}
