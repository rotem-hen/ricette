import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'app/shared/toast.service';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';
import { AngularFireAnalytics } from '@angular/fire/analytics';

export enum EmailAuthState {
  Login,
  Signup,
  Reset
}

@Component({
  selector: 'app-email-auth-modal',
  templateUrl: './email-auth-modal.component.html',
  styleUrls: ['./email-auth-modal.component.scss']
})
export class EmailAuthModalComponent implements OnDestroy {
  @ViewChild('emailAuthModal') modalRef: ElementRef;
  public state: EmailAuthState;
  public fEmailAuthState = EmailAuthState;
  public toastMessage: string;
  public loading = false;

  public emailAddressValue: string;
  public passwordValue: string;
  public secondPasswordValue: string;

  public emailAddressChanged: boolean;
  public passwordChanged: boolean;
  public secondPasswordChanged: boolean;

  private destroy$ = new Subject();

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private authService: AuthService,
    private analytics: AngularFireAnalytics
  ) {}

  public open(): void {
    this.emailAddressValue = this.passwordValue = this.secondPasswordValue = '';
    this.emailAddressChanged = this.passwordChanged = this.secondPasswordChanged = false;
    this.state = EmailAuthState.Login;
    this.toastService.removeAll();
    this.modalService.open(this.modalRef, {
      scrollable: true,
      backdrop: 'static',
      keyboard: false,
      beforeDismiss: () => {
        this.toastService.removeAll();
        return true;
      }
    });
  }

  public async onOK(modal, messageToast): Promise<void> {
    this.loading = true;
    try {
      switch (this.state) {
        case EmailAuthState.Login:
          await this.authService.emailSignIn(this.emailAddressValue, this.passwordValue);
          break;
        case EmailAuthState.Signup:
          await this.authService.emailSignup(this.emailAddressValue, this.passwordValue);
          break;
        case EmailAuthState.Reset:
          await this.authService.emailReset(this.emailAddressValue);
          this.toastMessage = 'אנא בדקו את תיבת המייל שלכם';
          this.toastService.show(messageToast, { classname: 'bg-success text-light', delay: 3000 });
          break;
      }
      this.loading = false;
      modal.close('Ok click');
    } catch (error) {
      this.toastMessage = error.message;
      this.toastService.show(messageToast, { classname: 'bg-danger text-light', delay: 3000 });
      this.loading = false;
    }
  }

  public onInputChange(event, field): void {
    this[`${field}Value`] = event.target.value;
    this[`${field}Changed`] = true;
  }

  get confirmButtonText(): string {
    switch (this.state) {
      case EmailAuthState.Login:
        return 'התחברות';
      case EmailAuthState.Signup:
        return 'הרשמה';
      case EmailAuthState.Reset:
        return 'איפוס סיסמה';
      default:
        return 'התחברות';
    }
  }

  get isEmailInvalid(): boolean {
    const emailRegex = /\S+@\S+\.\S+/;
    return this.emailAddressChanged && !emailRegex.test(this.emailAddressValue.toLowerCase());
  }

  get isPasswordInvalid(): boolean {
    return this.passwordChanged && this.state !== this.fEmailAuthState.Reset && this.passwordValue.length < 6;
  }

  get isSecondPasswordInvalid(): boolean {
    return (
      this.secondPasswordChanged &&
      this.state === EmailAuthState.Signup &&
      this.passwordValue !== this.secondPasswordValue
    );
  }

  get confirmButtonDisabled(): boolean {
    return (
      !this.emailAddressChanged ||
      (this.state !== EmailAuthState.Reset && !this.passwordChanged) ||
      (this.state === EmailAuthState.Signup && !this.secondPasswordChanged) ||
      this.isEmailInvalid ||
      this.isPasswordInvalid ||
      this.isSecondPasswordInvalid
    );
  }

  public setState(state: EmailAuthState): void {
    this.state = state;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
