import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../toast.service';
import { DatabaseService } from '../database.service';
import { AngularFireStorage } from 'angularfire2/storage';
import * as uuid from 'uuid';

@Component({
  selector: 'app-recipe-image-modal',
  templateUrl: './recipe-image-modal.component.html',
  styleUrls: ['./recipe-image-modal.component.scss']
})
export class RecipeImageModalComponent implements OnInit {
  @ViewChild('recipeImageModal') modalRef: ElementRef;
  public errorMessage: string;
  public loading = false;
  private imageStr: string;
  private recipeId: string;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private dbService: DatabaseService,
    private afStorage: AngularFireStorage
  ) {}

  public ngOnInit(): void {
    //this.dbService.getRecipes().subscribe(r => (this.recipeList = r));
  }

  public open(recipeId: string): void {
    this.recipeId = recipeId;
    this.modalService.open(this.modalRef, {
      scrollable: true,
      beforeDismiss: () => {
        this.toastService.removeAll();
        return true;
      }
    });
  }

  public async onOK(modal, errorToast): Promise<void> {
    this.loading = true;

    try {
      const imageBlob = await (await fetch(this.imageStr)).blob();
      const link = `recipeImages/${uuid.v4()}`;
      await this.afStorage.upload(link, imageBlob, {
        cacheControl: 'max-age=31536000'
      });

      await this.afStorage
        .ref(link)
        .getDownloadURL()
        .toPromise()
        .then(url => this.dbService.editRecipeImage(this.recipeId, url));

      modal.close('Ok click');
    } catch (error) {
      this.errorMessage = 'שגיאה בשמירת התמונה';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 8000 });
    }

    this.loading = false;
  }

  public onSelect(image: string): void {
    this.imageStr = image;
  }
}
