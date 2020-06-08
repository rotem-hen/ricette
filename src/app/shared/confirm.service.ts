import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from './confirm/confirm.component';
import { Button } from './interface/button.inteface';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  constructor(private modalService: NgbModal) {}

  public confirm(title: string, message: string, buttons: Button[]): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmComponent, { size: 'sm', windowClass: 'confirm' });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.buttons = buttons;

    return modalRef.result;
  }
}
