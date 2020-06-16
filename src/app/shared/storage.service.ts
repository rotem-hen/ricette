import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from 'angularfire2/storage';

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

  public async removeImage(url: string): Promise<void> {
    const photoRef = this.afStorage.storage.refFromURL(url);
    return photoRef.delete();
  }
}
