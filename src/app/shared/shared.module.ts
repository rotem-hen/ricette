import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';
import { GetUrlModalComponent } from './get-url-modal/get-url-modal.component';
import { ToastsContainerComponent } from './toasts-container/toasts-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxImgModule } from 'ngx-img';
import { FormsModule } from '@angular/forms';
import { ConfirmComponent } from './confirm/confirm.component';
import { RecipeImageModalComponent } from './recipe-image-modal/recipe-image-modal.component';
import { EmailAuthModalComponent } from './email-auth-modal/email-auth-modal.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';

@NgModule({
  declarations: [
    CategoryModalComponent,
    RecipeEditComponent,
    GetUrlModalComponent,
    ToastsContainerComponent,
    ConfirmComponent,
    RecipeImageModalComponent,
    EmailAuthModalComponent,
    WhatsNewComponent
  ],
  imports: [CommonModule, NgbModule, ColorPickerModule, NgxImgModule.forRoot(), FormsModule],
  exports: [
    CategoryModalComponent,
    RecipeEditComponent,
    GetUrlModalComponent,
    ToastsContainerComponent,
    ConfirmComponent,
    RecipeImageModalComponent,
    EmailAuthModalComponent
  ]
})
export class SharedModule {}
