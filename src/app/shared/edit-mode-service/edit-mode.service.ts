import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditModeService {
  public isEditMode = false;
  public editModeChange: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.editModeChange.subscribe(value => {
      this.isEditMode = value;
    });
  }

  public toggleEditMode(value = undefined): void {
    this.editModeChange.next(typeof value !== 'undefined' ? value : !this.isEditMode);
  }
}
