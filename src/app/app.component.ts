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
    private popupService: PopupService
  ) {}

  public ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.scroller.scrollTop();
        this.editModeService.toggleEditMode(false);
        if (val.url !== '/categories/3000') this.searchService.setSearchTerm('');

        if (localStorage.getItem('newVersion')) {
          this.popupService.whatsNew(
            ['ניתן להוסיף לינק לכל מתכון, בתחתית עמוד ההוספה / העריכה של המתכון'],
            [
              'בעיה עם העלאת תמונות תוקנה',
              'אפשרות חיבור גם דרך אימייל',
              'אם התקנתם את האתר כאפליקציה (במחשב, בטאבלט או בטלפון) ניתן לגשת למידע גם ללא אינטרנט, לאחר טעינה ראשונית עם חיבור',
              'שיתוף מתכון בוואטסאפ עובד גם במחשב בנוסף לטלפון'
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
  }

  title = 'Why is Everything Hard?';

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
