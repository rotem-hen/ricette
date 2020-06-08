import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private afStorage: AngularFireStorage) {}

  public upload(link: string, imageBlob: Blob): AngularFireUploadTask {
    return this.afStorage.upload(link, imageBlob, {
      cacheControl: 'max-age=31536000'
    });
  }

  public async getDownloadUrlFromLink(link: string): Promise<string> {
    return this.afStorage.ref(link).getDownloadURL().toPromise();
  }
}
