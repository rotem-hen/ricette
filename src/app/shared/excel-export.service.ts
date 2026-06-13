import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { DatabaseService } from './database.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  constructor(private dbService: DatabaseService) {}

  public async exportAllRecipesToExcel(
    onProgress?: (progress: { current: number; total: number }) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const recipes = await firstValueFrom(this.dbService.getRecipes());
    const sortedRecipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title, 'he'));
    const totalRecipes = sortedRecipes.length;

    // Create ZIP file for images
    const zip = new JSZip();
    const imagesFolder = zip.folder('תמונות');

    // Prepare data for Excel
    const excelData: any[] = [];

    let currentRecipe = 0;

    for (const recipe of sortedRecipes) {
      // Check if export was cancelled
      if (abortSignal?.aborted) {
        const error = new Error('Export cancelled');
        error.name = 'AbortError';
        throw error;
      }

      currentRecipe++;

      if (onProgress) {
        onProgress({ current: currentRecipe, total: totalRecipes });
      }

      // Download image if exists
      let imageName = '';
      if (recipe.image) {
        try {
          imageName = `${this.sanitizeFileName(recipe.title)}.jpg`;
          const imageBlob = await this.downloadImage(recipe.image);
          if (imagesFolder) {
            imagesFolder.file(imageName, imageBlob);
          }
        } catch (error) {
          console.error('Error downloading image:', error);
          imageName = '';
        }
      }

      // Add recipe to Excel data
      // Note: Excel uses \n for line breaks within cells
      excelData.push({
        'שם המתכון': recipe.title,
        'זמן הכנה (דקות)': recipe.duration || '',
        'כמות': recipe.quantity || '',
        'מרכיבים': recipe.ingredients || '', // Already has \n from the data
        'אופן הכנה': recipe.prep || '', // Already has \n from the data
        'קישור': recipe.link || '',
        'תמונה': imageName
      });
    }

    // Create Excel workbook using aoa (array of arrays) for better control
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['שם המתכון', 'זמן הכנה (דקות)', 'כמות', 'מרכיבים', 'אופן הכנה', 'קישור', 'תמונה'],
      ...excelData.map(recipe => [
        recipe['שם המתכון'],
        recipe['זמן הכנה (דקות)'],
        recipe['כמות'],
        recipe['מרכיבים'],
        recipe['אופן הכנה'],
        recipe['קישור'],
        recipe['תמונה']
      ])
    ]);

    // Apply cell styling to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (cell && typeof cell === 'object') {
          cell.s = {
            alignment: {
              wrapText: true,
              vertical: 'top',
              horizontal: 'right'
            }
          };
          // Make header row bold
          if (row === 0) {
            cell.s.font = { bold: true };
          }
        }
      }
    }

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // שם המתכון
      { wch: 15 }, // זמן הכנה
      { wch: 15 }, // כמות
      { wch: 40 }, // מרכיבים
      { wch: 50 }, // אופן הכנה
      { wch: 30 }, // קישור
      { wch: 20 }  // תמונה
    ];

    // Set row heights for data rows (to accommodate wrapped text)
    worksheet['!rows'] = [{ hpt: 20 }]; // Header row
    for (let i = 0; i < excelData.length; i++) {
      worksheet['!rows'].push({ hpt: 100 }); // Data rows - taller to show wrapped text
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'מתכונים');

    // Set sheet to RTL (right-to-left)
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;

    // Convert workbook to binary
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    // Add Excel file to ZIP
    zip.file('מתכונים.xlsx', excelBuffer);

    // Generate ZIP file and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'מתכונים.zip');
  }

  private async downloadImage(url: string): Promise<Blob> {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error('Failed to download image');
      }
      return response.blob();
    } catch (error) {
      console.error('Error downloading image:', error);
      // Return empty blob if download fails
      return new Blob();
    }
  }

  private sanitizeFileName(name: string): string {
    // Remove invalid file name characters
    return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
  }
}
