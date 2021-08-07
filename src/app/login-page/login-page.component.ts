import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopupService } from 'app/shared/popup.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  private destroy$ = new Subject();

  constructor(public authService: AuthService, private popupService: PopupService, private router: Router) {}

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(async user => {
      if (user) this.router.navigate(['']);
    });
  }

  public openEmailAuthModal(emailAuthModal): void {
    emailAuthModal.open();
  }

  public async onContactClick(): Promise<void> {
    await this.popupService.contact();
  }
}
