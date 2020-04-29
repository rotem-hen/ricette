import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public menuShown = false;

  public onMenuClick(): void {
    this.menuShown = !this.menuShown;
  }
}
