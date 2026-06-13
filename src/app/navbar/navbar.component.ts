import { Component, ViewChild, TemplateRef } from '@angular/core';
import { EditModeService } from 'app/shared/edit-mode.service';
import { Router } from '@angular/router';
import { SpecialCategories } from '../content/category-views/category-views';
import { SearchService } from 'app/shared/search.service';
import { AuthService } from 'app/shared/auth.service';
import { PopupService } from '../shared/popup.service';
import { Button } from 'app/shared/interface/button.inteface';
import { PdfExportService } from 'app/shared/pdf-export.service';
import { ExcelExportService } from 'app/shared/excel-export.service';
import { ToastService } from 'app/shared/toast.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent {
  @ViewChild('exportProgress') exportProgressTemplate: TemplateRef<any>;

  public collapsed = true;
  public exportMessage = '';
  private exportAbortController: AbortController | null = null;

  public navButtons = [
    {
      text: 'קטגוריות',
      onClick: (): void => this.onNavButtonClick(['categories']),
      iconClasses: 'fas fa-th-large'
    },
    {
      text: 'כל המתכונים',
      onClick: (): void => this.onNavButtonClick(['categories', SpecialCategories.ALL]),
      iconClasses: 'fas fa-list-ul'
    },
    {
      text: 'מועדפים',
      onClick: (): void => this.onNavButtonClick(['categories', SpecialCategories.FAVORITES]),
      iconClasses: 'far fa-star'
    },
    {
      text: 'צרו קשר',
      onClick: (): Promise<void> => this.onContactClick(),
      iconClasses: 'far fa-star'
    }
  ];

  constructor(
    public router: Router,
    public editModeService: EditModeService,
    public searchService: SearchService,
    public authService: AuthService,
    public popupService: PopupService,
    private pdfExportService: PdfExportService,
    private excelExportService: ExcelExportService,
    private toastService: ToastService
  ) {}

  public onMenuClick(): void {
    this.editModeService.toggleEditMode(false);
  }

  public onEditClick(): void {
    const [, type] = this.router.url.split('/');
    if (type === 'recipes' && this.editModeService.isEditMode) return;
    this.editModeService.toggleEditMode();
  }

  public searchInputClick(): void {
    this.editModeService.toggleEditMode(false);
  }

  public onNavButtonClick(link: string[]): void {
    this.editModeService.toggleEditMode(false);
    this.collapsed = true;
    this.router.navigate(link);
  }

  public async onContactClick(): Promise<void> {
    this.collapsed = true;
    await this.popupService.contact();
  }

  public onSearchInputChange(event): void {
    this.searchService.setSearchTerm(event.target.value);
    if (this.router.url !== `/categories/${SpecialCategories.SEARCH_RESULTS}`) {
      this.router.navigate(['/categories', SpecialCategories.SEARCH_RESULTS]);
    }
  }

  public async onExportClick(): Promise<void> {
    this.collapsed = true;

    const confirmButtons: Button[] = [
      {
        text: 'ייצוא ל-PDF',
        color: '#90c695',
        action: (): Promise<void> => this.startExport('pdf')
      },
      {
        text: 'ייצוא לטבלה',
        color: '#9ec6e3',
        action: (): Promise<void> => this.startExport('excel')
      }
    ];

    await this.popupService.confirm(
      'ייצוא מתכונים',
      'בחרו את סוג הייצוא. כל המתכונים ייוצאו בסדר אלפביתי, כולל תמונות. התהליך יכול לקחת כמה דקות אבל ניתן להמשיך להשתמש בריצֶ\'טֶה כרגיל.',
      confirmButtons
    );
  }

  private async startExport(type: 'pdf' | 'excel'): Promise<void> {
    this.toastService.removeAll();
    this.exportAbortController = new AbortController();

    await new Promise(resolve => setTimeout(resolve, 100));

    this.exportMessage = 'מייצא מתכונים...';
    this.toastService.show(this.exportProgressTemplate, {
      classname: 'bg-info text-light',
      delay: 600000  // 10 minutes - long enough for any export
    });

    try {
      const progressCallback = (progress: { current: number; total: number }): void => {
        this.exportMessage = `מייצא מתכונים... (${progress.current} מתוך ${progress.total})`;
      };

      if (type === 'pdf') {
        await this.pdfExportService.exportAllRecipesToPdf(progressCallback, this.exportAbortController.signal);
      } else {
        await this.excelExportService.exportAllRecipesToExcel(progressCallback, this.exportAbortController.signal);
      }

      this.toastService.removeAll();
      this.toastService.show('הקובץ הורד בהצלחה!', {
        classname: 'bg-success text-light',
        delay: 3000
      });
    } catch (error) {
      this.toastService.removeAll();

      if (error instanceof Error && error.name === 'AbortError') {
        this.toastService.show('הייצוא בוטל', {
          classname: 'bg-info text-light',
          delay: 3000
        });
      } else {
        console.error(`Error exporting ${type}:`, error);
        this.toastService.show('שגיאה בייצוא הקובץ', {
          classname: 'bg-danger text-light',
          delay: 3000
        });
      }
    } finally {
      this.exportAbortController = null;
    }
  }

  public cancelExport(): void {
    if (this.exportAbortController) {
      this.exportAbortController.abort();
    }
  }
}
