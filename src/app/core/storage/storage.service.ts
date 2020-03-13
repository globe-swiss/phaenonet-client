import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable()
export class StorageService {
  constructor(private afStorage: AngularFireStorage) {}

  uploadFile(path: string, file: File): Observable<number> {
    const ref = this.afStorage.ref(path);
    return ref.put(file).percentageChanges();
  }
}
