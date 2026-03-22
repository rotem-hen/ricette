import { NgZone } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';

export function enterZone<T>(ngZone: NgZone): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(observer =>
      source.subscribe({
        next: v => ngZone.run(() => observer.next(v)),
        error: e => ngZone.run(() => observer.error(e)),
        complete: () => ngZone.run(() => observer.complete())
      })
    );
}
