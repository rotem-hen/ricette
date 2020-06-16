import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../toast.service';
import { DatabaseService } from '../database.service';
import * as uuid from 'uuid';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-recipe-image-modal',
  templateUrl: './recipe-image-modal.component.html',
  styleUrls: ['./recipe-image-modal.component.scss']
})
export class RecipeImageModalComponent {
  @ViewChild('recipeImageModal') modalRef: ElementRef;
  public errorMessage: string;
  public loading = false;
  private imageStr: string;
  private recipeId: string;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private dbService: DatabaseService,
    private storageService: StorageService
  ) {}

  public open(recipeId: string): void {
    this.recipeId = recipeId;
    this.imageStr = null;
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
      const imageBlob = await (await fetch(this.imageStr)).blob();
      const fileName = `recipeImages/${uuid.v4()}`;
      await this.storageService.upload(fileName, imageBlob);
      const url = await this.storageService.getDownloadUrlFromLink(fileName);
      await this.dbService.editRecipeImage(this.recipeId, url);

      modal.close('Ok click');
    } catch (error) {
      this.errorMessage = 'שגיאה בשמירת התמונה';
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
}
