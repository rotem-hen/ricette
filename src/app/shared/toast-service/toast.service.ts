import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  public show(textOrTpl: string | TemplateRef<any>, options: any = {}): void {
    if (!this.toasts.length) this.toasts.push({ textOrTpl, ...options });
  }

  public remove(toast): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  public removeAll(): void {
    this.toasts = [];
  }
}
