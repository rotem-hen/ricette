import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'app/shared/toast.service';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';
import { AngularFireAnalytics } from '@angular/fire/analytics';

export enum EmailAuthState {
  Login,
  Signin,
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
  public emailAddressValue: string;
  public passwordValue: string;
  public secondPasswordValue: string;
  public errorMessage: string;
  public loading = false;

  private destroy$ = new Subject();

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private authService: AuthService,
    private analytics: AngularFireAnalytics
  ) {}

  public open(): void {
    this.emailAddressValue = this.passwordValue = this.secondPasswordValue = '';
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

  public async onOK(modal, errorToast): Promise<void> {
    if (false) {
      this.errorMessage = 'אנא בחרו שם וצבע לקטגוריה';
      this.toastService.show(errorToast, { classname: 'bg-danger text-light', delay: 3000 });
      return;
    }
    modal.close('Ok click');
  }

  public onEmailAddressNameInputChange(event): void {
    this.emailAddressValue = event.target.value;
  }

  public onPasswordNameInputChange(event): void {
    this.passwordValue = event.target.value;
  }

  public onSecondPasswordNameInputChange(event): void {
    this.secondPasswordValue = event.target.value;
  }

  get confirmButtonText(): string {
    switch (this.state) {
      case EmailAuthState.Login:
        return 'התחברות';
      case EmailAuthState.Signin:
        return 'הרשמה';
      case EmailAuthState.Reset:
        return 'איפוס סיסמה';
      default:
        return 'התחברות';
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
