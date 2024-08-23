import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(private afStorage: AngularFireStorage) {}

  uploadFile(path: string, file: File): Observable<number> {
    const ref = this.afStorage.ref(path);
    return ref.put(file).percentageChanges();
  }
}
