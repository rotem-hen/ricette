import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { EditModeService } from 'app/shared/edit-mode.service';

@Component({
  selector: 'app-content-title',
  templateUrl: './content-title.component.html',
  styleUrls: ['./content-title.component.scss']
})
export class ContentTitleComponent {
  @Input() title: string;
  @Input() onEdit: () => void;
  @Input() showEdit: boolean;

  constructor(private location: Location, public editModeService: EditModeService) {}

  public onBack(): void {
    this.location.back();
  }

  public onEditClick(): void {
    this.onEdit();
  }
}
