import { ErrorHandler, Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private analytics: AngularFireAnalytics) {}

  handleError(error): void {
    console.error(error);
    this.analytics.logEvent('error', { type: 'general', message: error.message });
  }
}
