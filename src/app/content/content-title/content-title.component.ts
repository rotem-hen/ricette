import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-content-title',
  templateUrl: './content-title.component.html',
  styleUrls: ['./content-title.component.css']
})
export class ContentTitleComponent {
  @Input() title;

  constructor(private _location: Location) {}

  public onBack(): void {
    this._location.back();
  }
}
