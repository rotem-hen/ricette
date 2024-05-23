import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, Scroll } from '@angular/router';
import { EditModeService } from './shared/edit-mode.service';
import { SearchService } from './shared/search.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService, LoginState } from './shared/auth.service';
import { SwUpdate } from '@angular/service-worker';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { BeforeInstallPromptEvent } from 'typings';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { PopupService } from './shared/popup.service';
import { StateService } from './shared/state.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  public updateExist = false;
  public LoginState = LoginState;

  constructor(
    private router: Router,
    private editModeService: EditModeService,
    private searchService: SearchService,
    public authService: AuthService,
    private swUpdate: SwUpdate,
    private analytics: AngularFireAnalytics,
    private tooltipConfig: NgbTooltipConfig,
    private popupService: PopupService,
    private stateService: StateService,
    private viewportScroller: ViewportScroller
  ) {
  }

  public ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val instanceof Scroll && val.position) {
        setTimeout(() => {
          this.viewportScroller.scrollToPosition(val.position);
        }, 20);
      }
      if (val instanceof NavigationEnd) {
        this.editModeService.toggleEditMode(false);
        if (val.url !== '/categories/3000') this.searchService.setSearchTerm('');

        if (val.url.match(new RegExp('^.*/recipes/.*$'))) {
          const id = val.url.substring(val.url.lastIndexOf('/') + 1);
          this.stateService.setStateById(id, val.url, null, null, true);
        } else if (val.url.includes('/categories') || val.url === '/') {
          this.stateService.clearLastRecipe(false);
        }

        if (localStorage.getItem('newVersion')) {
          this.popupService.whatsNew(
            ['תיקון באגים בהוספת מתכון חדש'],
            [
              'סימונים במתכון (כמו מחיקת מצרכים וסימון שלב) יישארו גם ביציאה ממנו וחזרה אליו, ויאופסו רק לאחר כשעתיים ללא שימוש'
            ]
          );
          localStorage.setItem('newVersion', '');
        }
      }
    });

    this.tooltipConfig.disableTooltip = 'ontouchstart' in document.documentElement;
    this.tooltipConfig.openDelay = 600;

    window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
      this.analytics.logEvent('install_prompt');
      e.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          this.analytics.logEvent('pwa_install');
        }
      });
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.updateExist = true;
      });
    }

    this.stateService.redirectToLastRecipe();
  }

  title = 'Why is Everything Hard?';

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
