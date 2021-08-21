import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from './confirm/confirm.component';
import { ContactComponent } from './contact/contact.component';
import { Button } from './interface/button.inteface';
import { WhatsNewComponent } from './whats-new/whats-new.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  constructor(private modalService: NgbModal) {}

  public confirm(title: string, message: string, buttons: Button[]): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmComponent, { size: 'sm', windowClass: 'popup', centered: true });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.buttons = buttons;

    return modalRef.result;
  }

  public contact(): Promise<boolean> {
    const modalRef = this.modalService.open(ContactComponent, { size: 'sm', windowClass: 'popup', centered: true });
    return modalRef.result;
  }

  public whatsNew(newStuff: string[], olderStuff: string[]): Promise<boolean> {
    const modalRef = this.modalService.open(WhatsNewComponent, {
      size: 'sm',
      windowClass: 'popup',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.newStuff = newStuff;
    modalRef.componentInstance.olderStuff = olderStuff;
    return modalRef.result;
  }
}
