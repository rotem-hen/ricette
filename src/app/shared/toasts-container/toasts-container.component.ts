import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts-container.component.html',
  host: { '[class.ngb-toasts]': 'true' }
})
export class ToastsContainerComponent {
  constructor(public toastService: ToastService) {}

  public isTemplate(toast): boolean {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
