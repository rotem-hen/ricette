import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.css']
})
export class AddButtonComponent implements OnInit {

  public showPopover: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  togglePopover() {
    this.showPopover = !this.showPopover;
    if (this.showPopover) {
      document.addEventListener('click', this.onOutsideClick);
    } else {
      document.removeEventListener('click', this.onOutsideClick);
    }
  }

  private onOutsideClick = (e) => {
    if (e.target.offsetParent.nodeName.toLowerCase() === 'app-add-button') { return; }
    this.showPopover = !this.showPopover;
    document.removeEventListener('click', this.onOutsideClick);
  }
}
