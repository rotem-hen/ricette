import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { RecipeModalComponent } from './recipe-modal/recipe-modal.component';
import { ToastsContainerComponent } from './toasts-container/toasts-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxImgModule } from 'ngx-img';
import { FormsModule } from '@angular/forms';
import { RecipeImageModalComponent } from './recipe-image-modal/recipe-image-modal.component';

@NgModule({
  declarations: [
    CategoryModalComponent,
    RecipeModalComponent,
    ToastsContainerComponent,
    RecipeImageModalComponent
  ],
  imports: [CommonModule, NgbModule, ColorPickerModule, NgxImgModule.forRoot(), FormsModule],
  exports: [
    CategoryModalComponent,
    RecipeModalComponent,
    ToastsContainerComponent,
    RecipeImageModalComponent
  ]
})
export class SharedModule {}
