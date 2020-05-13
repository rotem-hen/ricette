import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public searchTerm = '';
  public searchTermChange: Subject<string> = new Subject<string>();

  constructor() {
    this.searchTermChange.subscribe(value => {
      this.searchTerm = value;
    });
  }

  public setSearchTerm(value): void {
    this.searchTermChange.next(value);
  }
}
