import { Component } from '@angular/core';
import { PopupService } from 'app/shared/popup.service';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  constructor(public authService: AuthService, private popupService: PopupService) {}

  public openEmailAuthModal(emailAuthModal): void {
    emailAuthModal.open();
  }

  public onContactClick(): void {
    this.popupService
      .contact()
      .then()
      .catch(() => {
        // User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)
      });
  }
}
