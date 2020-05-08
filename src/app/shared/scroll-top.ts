import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Scroller {
  public scrollTop(): void {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
}
