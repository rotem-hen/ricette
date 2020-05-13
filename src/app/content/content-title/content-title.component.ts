import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { EditModeService } from 'app/shared/edit-mode-service/edit-mode.service';
import { Scroller } from 'app/shared/scroll-top';

@Component({
  selector: 'app-content-title',
  templateUrl: './content-title.component.html',
  styleUrls: ['./content-title.component.css']
})
export class ContentTitleComponent {
  @Input() title;

  constructor(private _location: Location, private editModeService: EditModeService, private scroller: Scroller) {}

  public onBack(): void {
    this._location.back();
  }
}
