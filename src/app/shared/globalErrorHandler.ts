import { ErrorHandler, Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private analytics: AngularFireAnalytics) {}

  handleError(error): void {
    this.analytics.logEvent('error', { type: 'general', message: error.message });
  }
}
