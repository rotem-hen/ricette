import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { EditModeService } from './shared/edit-mode.service';
import { Scroller } from './shared/scroll-top.service';
import { SearchService } from './shared/search.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService, LoginState } from './shared/auth.service';
import { SwUpdate } from '@angular/service-worker';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { BeforeInstallPromptEvent } from 'typings';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { PopupService } from './shared/popup.service';
import { StateService } from './shared/state.service';

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
    private scroller: Scroller,
    private searchService: SearchService,
    public authService: AuthService,
    private swUpdate: SwUpdate,
    private analytics: AngularFireAnalytics,
    private tooltipConfig: NgbTooltipConfig,
    private popupService: PopupService,
    private stateService: StateService
  ) {}

  public ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.scroller.scrollTop();
        this.editModeService.toggleEditMode(false);
        if (val.url !== '/categories/3000') this.searchService.setSearchTerm('');

        if (val.url.match(new RegExp('^.*/recipes/.*$'))) {
          this.stateService.setState(val.url, null, null);
        } else if (val.url.includes('/categories') || val.url === '/') {
          this.stateService.clearState();
        }

        if (localStorage.getItem('newVersion')) {
          this.popupService.whatsNew(
            [
              'החיפוש הורחב גם למרכיבים (ולא רק שם המתכון)',
              'בחזרה מתוצאת חיפוש, מילות החיפוש יישמרו'
            ],
            [
              'עדכון פונט לשיפור הקריאוּת.',
              'בעיה תוקנה: האפליקציה חזרה למסך הראשי לאחר מעבר בין אפליקציות.',
              'בעיה תוקנה: לאחר החלפה בין משתמשים עדיין הוצג המשתמש הקודם.'
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
