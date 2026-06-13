import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DatabaseService } from './database.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private imageCache = new Map<string, string>(); // URL → data URL cache

  constructor(private dbService: DatabaseService) {}

  public async exportAllRecipesToPdf(
    onProgress?: (progress: { current: number; total: number }) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const recipes = await firstValueFrom(this.dbService.getRecipes());
    const sortedRecipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title, 'he'));
    const totalRecipes = sortedRecipes.length;

    // Pre-load and inline all external assets to avoid repeated fetches
    const inlinedStyles = await this.preloadAssets();

    // Create a completely isolated iframe to prevent html2canvas from accessing page stylesheets
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '170mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Failed to create iframe document');
    }

    // Write minimal HTML structure
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: white;
            font-family: Arial, sans-serif;
            direction: rtl;
            font-size: 14px;
            line-height: 1.6;
          }
          ${inlinedStyles}
        </style>
      </head>
      <body>
        <div id="pdf-container" style="width: 170mm; padding: 0; background-color: white;"></div>
      </body>
      </html>
    `);
    iframeDoc.close();

    const container = iframeDoc.getElementById('pdf-container') as HTMLElement;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let isFirstPage = true;
    let currentRecipe = 0;

    for (const recipe of sortedRecipes) {
      // Check if export was cancelled
      if (abortSignal?.aborted) {
        document.body.removeChild(iframe);
        const error = new Error('Export cancelled');
        error.name = 'AbortError';
        throw error;
      }

      currentRecipe++;

      if (onProgress) {
        onProgress({ current: currentRecipe, total: totalRecipes });
      }

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Clear container
      container.innerHTML = '';

      // Build sections as separate renderable elements
      const sections: Array<{ html: string; type: string; url?: string }> = [];

      // Title section
      sections.push({
        html: `<h1 style="font-size: 22px; margin: 0; font-weight: bold; line-height: 1.3;">${this.escapeHtml(recipe.title)}</h1>`,
        type: 'title',
        url: undefined
      });

      // Image section - convert to data URL to avoid CORS issues
      if (recipe.image) {
        try {
          // Check cache first
          let dataUrl = this.imageCache.get(recipe.image);
          if (!dataUrl) {
            const response = await fetch(recipe.image);
            const blob = await response.blob();
            dataUrl = await this.blobToDataURL(blob);
            this.imageCache.set(recipe.image, dataUrl);
          }
          sections.push({
            html: `<img src="${dataUrl}" style="max-width: 50%; height: auto; display: block;" />`,
            type: 'image',
            url: undefined
          });
        } catch (error) {
          console.error('Error loading image:', error);
          // Skip image if it fails to load
        }
      }

      // Duration
      if (recipe.duration) {
        sections.push({
          html: `<p style="margin: 0; line-height: 1.5;"><strong>זמן הכנה:</strong> ${recipe.duration} דקות</p>`,
          type: 'info',
          url: undefined
        });
      }

      // Quantity
      if (recipe.quantity) {
        sections.push({
          html: `<p style="margin: 0; line-height: 1.5;"><strong>כמות:</strong> ${this.escapeHtml(recipe.quantity)}</p>`,
          type: 'info',
          url: undefined
        });
      }

      // Ingredients header
      if (recipe.ingredients) {
        sections.push({
          html: `<h3 style="margin: 0; font-weight: bold; font-size: 18px;">מרכיבים:</h3>`,
          type: 'header',
          url: undefined
        });

        // Each ingredient as a separate section
        const ingredients = recipe.ingredients.split('\n').filter(line => line.trim());
        ingredients.forEach(ingredient => {
          sections.push({
            html: `<div style="margin: 0; line-height: 1.6;">${this.escapeHtml(ingredient.trim())}</div>`,
            type: 'ingredient',
            url: undefined
          });
        });
      }

      // Preparation header
      if (recipe.prep) {
        sections.push({
          html: `<h3 style="margin: 0; font-weight: bold; font-size: 18px;">אופן הכנה:</h3>`,
          type: 'header',
          url: undefined
        });

        // Each prep line as a separate section
        const prepLines = recipe.prep.split('\n').filter(line => line.trim());
        prepLines.forEach(line => {
          sections.push({
            html: `<p style="margin: 0; line-height: 1.6;">${this.escapeHtml(line.trim())}</p>`,
            type: 'prep',
            url: undefined
          });
        });
      }

      // Link
      if (recipe.link) {
        sections.push({
          html: `<p style="margin: 0; font-size: 12px; font-style: italic; line-height: 1.5;"><strong>קישור:</strong> ${this.escapeHtml(recipe.link)}</p>`,
          type: 'link',
          url: recipe.link
        });
      }

      // Now render sections one by one and add to PDF
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      let currentY = margin;

      // Batch sections to reduce html2canvas calls (major performance improvement)
      const sectionBatches = this.batchSections(sections);

      for (const batch of sectionBatches) {
        // Combine all sections in batch into single HTML
        const combinedHtml = batch.sections.map(s => s.html).join('');

        // Update content div with batched HTML
        const contentDiv = container.querySelector('#pdf-content') as HTMLElement;
        if (contentDiv) {
          contentDiv.innerHTML = `<div style="direction: rtl; text-align: right;">${combinedHtml}</div>`;
        } else {
          // First section - create the content div
          const newContentDiv = document.createElement('div');
          newContentDiv.id = 'pdf-content';
          newContentDiv.innerHTML = `<div style="direction: rtl; text-align: right;">${combinedHtml}</div>`;
          container.appendChild(newContentDiv);
        }

        // Wait for images if batch contains image sections
        if (batch.hasImage) {
          const imgs = container.getElementsByTagName('img');
          if (imgs.length > 0) {
            await this.waitForImages(imgs);
          }
        }

        // Single html2canvas call for entire batch
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: false, // Data URLs don't need CORS
          allowTaint: true, // Allow data URLs without CORS checks
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0,
          onclone: (clonedDoc: Document) => {
            // Remove all external stylesheets from cloned document to prevent refetching
            const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => link.remove());

            // Remove all external style imports
            const styles = clonedDoc.querySelectorAll('style');
            styles.forEach(style => {
              if (style.textContent && style.textContent.includes('@import')) {
                style.textContent = style.textContent.replace(/@import[^;]+;/g, '');
              }
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add spacing before batch based on first section type
        const spacingBefore =
          batch.sections[0].type === 'title' ? 0 :
          batch.sections[0].type === 'header' ? 10 :
          batch.sections[0].type === 'image' ? 5 :
          batch.sections[0].type === 'info' ? 3 :
          batch.sections[0].type === 'link' ? 10 : 2;

        currentY += spacingBefore;

        // Check if batch fits on current page
        if (currentY + imgHeight > pageHeight - margin) {
          // Doesn't fit - add new page
          pdf.addPage();
          currentY = margin;
        }

        // Add batched render to PDF
        pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);

        // If batch contains a link section, make it clickable
        const linkSection = batch.sections.find(s => s.type === 'link' && s.url);
        if (linkSection) {
          pdf.link(margin, currentY, imgWidth, imgHeight, { url: linkSection.url });
        }

        currentY += imgHeight;
      }
    }

    // Remove temporary iframe
    document.body.removeChild(iframe);

    // Clear image cache to free memory
    this.imageCache.clear();

    pdf.save('מתכונים.pdf');
  }

  private batchSections(sections: Array<{ html: string; type: string; url?: string }>): Array<{ sections: Array<{ html: string; type: string; url?: string }>; hasImage: boolean }> {
    const batches: Array<{ sections: Array<{ html: string; type: string; url?: string }>; hasImage: boolean }> = [];
    let currentBatch: Array<{ html: string; type: string; url?: string }> = [];
    let currentBatchType: string | null = null;

    for (const section of sections) {
      // Batching strategy to reduce html2canvas calls:
      // - Title + Duration + Quantity together (metadata)
      // - Image alone (needs separate processing for quality)
      // - Ingredients header + up to 6 ingredient lines
      // - Prep header + up to 6 prep lines
      // - Link alone

      if (section.type === 'image' || section.type === 'link') {
        // Flush current batch, render image/link alone
        if (currentBatch.length > 0) {
          batches.push({
            sections: [...currentBatch],
            hasImage: currentBatch.some(s => s.type === 'image')
          });
          currentBatch = [];
        }
        batches.push({
          sections: [section],
          hasImage: section.type === 'image'
        });
        currentBatchType = null;
      } else if (section.type === 'title' || section.type === 'info') {
        // Batch title and info (duration, quantity) together
        if (currentBatchType === 'metadata') {
          currentBatch.push(section);
        } else {
          if (currentBatch.length > 0) {
            batches.push({
              sections: [...currentBatch],
              hasImage: currentBatch.some(s => s.type === 'image')
            });
          }
          currentBatch = [section];
          currentBatchType = 'metadata';
        }
      } else if (section.type === 'header' || section.type === 'ingredient' || section.type === 'prep') {
        // Batch ingredients/prep in groups of 6
        const isCompatible = (currentBatchType === 'ingredient' && (section.type === 'ingredient' || section.type === 'header')) ||
                            (currentBatchType === 'prep' && (section.type === 'prep' || section.type === 'header')) ||
                            currentBatchType === null;

        if (isCompatible && currentBatch.length < 6) {
          currentBatch.push(section);
          if (section.type === 'ingredient') {
            currentBatchType = 'ingredient';
          } else if (section.type === 'prep') {
            currentBatchType = 'prep';
          }
        } else {
          if (currentBatch.length > 0) {
            batches.push({
              sections: [...currentBatch],
              hasImage: currentBatch.some(s => s.type === 'image')
            });
          }
          currentBatch = [section];
          if (section.type === 'ingredient') {
            currentBatchType = 'ingredient';
          } else if (section.type === 'prep') {
            currentBatchType = 'prep';
          } else {
            currentBatchType = null;
          }
        }
      } else {
        // Unknown section type - render separately
        if (currentBatch.length > 0) {
          batches.push({
            sections: [...currentBatch],
            hasImage: currentBatch.some(s => s.type === 'image')
          });
          currentBatch = [];
        }
        batches.push({
          sections: [section],
          hasImage: false
        });
        currentBatchType = null;
      }
    }

    // Flush remaining batch
    if (currentBatch.length > 0) {
      batches.push({
        sections: [...currentBatch],
        hasImage: currentBatch.some(s => s.type === 'image')
      });
    }

    return batches;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async waitForImages(images: HTMLCollectionOf<HTMLImageElement>): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.complete) {
        promises.push(
          new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve even on error to continue
            // Image src is already set, just wait for it to load
          })
        );
      }
    }
    await Promise.all(promises);
  }

  /**
   * Fetches a CSS file and returns its content as a string
   */
  private async fetchCSSAsText(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch CSS from ${url}`);
        return '';
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching CSS from ${url}:`, error);
      return '';
    }
  }

  /**
   * Fetches a font file and converts it to a base64 data URL
   */
  private async fetchFontAsDataURL(path: string): Promise<string> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`Failed to fetch font from ${path}`);
        return '';
      }
      const blob = await response.blob();
      return await this.blobToDataURL(blob);
    } catch (error) {
      console.error(`Error fetching font from ${path}:`, error);
      return '';
    }
  }

  /**
   * Pre-loads and inlines all external assets (fonts, CSS) to avoid repeated fetches by html2canvas
   */
  private async preloadAssets(): Promise<string> {
    const styleContent: string[] = [];

    // 1. Fetch external CSS (Google Fonts, Font Awesome)
    const googleFontsCSS = await this.fetchCSSAsText('https://fonts.googleapis.com/css?family=Lato:300,400,700');
    if (googleFontsCSS) {
      styleContent.push(`/* Google Fonts - Lato */\n${googleFontsCSS}`);
    }

    const fontAwesomeCSS = await this.fetchCSSAsText('https://maxst.icons8.com/vue-static/landings/line-awesome/font-awesome-line-awesome/css/all.min.css');
    if (fontAwesomeCSS) {
      styleContent.push(`/* Font Awesome Line Awesome */\n${fontAwesomeCSS}`);
    }

    // 2. Inline local fonts as data URLs
    const localFonts = [
      { name: 'Stanga', path: 'assets/fonts/stanga-regular-aaa.woff', format: 'woff', weight: 'normal' },
      { name: 'Stanga-Bold', path: 'assets/fonts/stanga-bold-aaa.ttf', format: 'truetype', weight: 'bold' },
      { name: 'Rounded', path: 'assets/fonts/MPLUSRounded1c-Light.ttf', format: 'truetype', weight: '300' },
      { name: 'icomoon', path: 'assets/fonts/icomoon/icomoon.woff', format: 'woff', weight: 'normal' },
      { name: 'codropsicons', path: 'assets/fonts/codropsicons/codropsicons.woff', format: 'woff', weight: 'normal' }
    ];

    for (const font of localFonts) {
      const dataURL = await this.fetchFontAsDataURL(font.path);
      if (dataURL) {
        styleContent.push(`
@font-face {
  font-family: '${font.name}';
  src: url('${dataURL}') format('${font.format}');
  font-weight: ${font.weight};
  font-style: normal;
}
        `.trim());
      }
    }

    return styleContent.join('\n\n');
  }
}
