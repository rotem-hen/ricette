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
  }

}
