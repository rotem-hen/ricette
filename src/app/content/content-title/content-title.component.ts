import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-content-title',
  templateUrl: './content-title.component.html',
  styleUrls: ['./content-title.component.scss']
})
export class ContentTitleComponent {
  @Input() title: string;

  constructor(private location: Location) {}

  public onBack(): void {
    this.location.back();
  }
}
