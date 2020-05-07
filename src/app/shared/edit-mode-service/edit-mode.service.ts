import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditModeService {
  public isEditMode = false;

  public toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }
}
