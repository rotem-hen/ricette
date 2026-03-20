import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private afStorage: AngularFireStorage, private injector: EnvironmentInjector) {}

  public upload(link: string, imageBlob: Blob): AngularFireUploadTask {
    return runInInjectionContext(this.injector, () =>
      this.afStorage.upload(link, imageBlob, {
        cacheControl: 'max-age=31536000'
      })
    );
  }

  public async getDownloadUrlFromLink(link: string): Promise<string> {
    return lastValueFrom(
      runInInjectionContext(this.injector, () =>
        this.afStorage.ref(link).getDownloadURL()
      )
    );
  }

  public async removeImage(url: string): Promise<void> {
    const photoRef = this.afStorage.storage.refFromURL(url);
    return photoRef.delete();
  }
}
