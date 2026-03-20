import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnDestroy {
  @Input() set imgSrc(value: string) {
    if (value) {
      this.previewUrl = value;
      this.initCropperOnLoad();
    }
  }
  @Output() imageCropped = new EventEmitter<string>();
  @Output() imageReset = new EventEmitter<void>();
  @ViewChild('imageElement') imageElement: ElementRef<HTMLImageElement>;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  previewUrl: string = null;
  private cropper: Cropper = null;

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!['image/gif', 'image/jpeg', 'image/png'].includes(file.type)) return;
    if (file.size > 10000000) return; // 10MB limit

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.imageReset.emit();
      this.initCropperOnLoad();
    };
    reader.readAsDataURL(file);
  }

  onReset(): void {
    this.destroyCropper();
    this.previewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.imageReset.emit();
  }

  private initCropperOnLoad(): void {
    // Wait for Angular to render the image element
    setTimeout(() => {
      if (!this.imageElement) return;
      this.destroyCropper();

      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 1,
        viewMode: 1,
        crop: () => {
          this.emitCroppedImage();
        }
      });
    });
  }

  private emitCroppedImage(): void {
    if (!this.cropper) return;
    const canvas = this.cropper.getCroppedCanvas({
      maxWidth: 1000,
      maxHeight: 1000
    });
    if (canvas) {
      this.imageCropped.emit(canvas.toDataURL('image/jpeg'));
    }
  }

  private destroyCropper(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }
}
