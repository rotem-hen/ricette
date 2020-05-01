import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-category-modal',
  templateUrl: './new-category-modal.component.html',
  styleUrls: ['./new-category-modal.component.css']
})
export class NewCategoryModalComponent {
  @ViewChild('newCategoryModal') modalRef: ElementRef;

  constructor(private modalService: NgbModal) {}

  public open(): void {
    this.modalService.open(this.modalRef, { scrollable: true });
  }
}
