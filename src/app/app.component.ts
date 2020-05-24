import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { EditModeService } from './shared/edit-mode-service/edit-mode.service';
import { Scroller } from './shared/scroll-top';
import { SearchService } from './shared/search-service/search.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './shared/auth-service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject();

  constructor(
    private router: Router,
    private editModeService: EditModeService,
    private scroller: Scroller,
    private searchService: SearchService,
    public authService: AuthService
  ) {
    router.events.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.scroller.scrollTop();
        this.editModeService.toggleEditMode(false);
        if (val.url !== '/categories/3000') this.searchService.setSearchTerm('');
      }
    });
  }

  title = 'Why is Everything Hard?';

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
