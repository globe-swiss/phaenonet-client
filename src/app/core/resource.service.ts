import { Observable } from 'rxjs';

export interface ResourceService<T> {
  list(): Observable<T[]>;

  upsert(t: T, id: string): Observable<T>;

  get(id: string): Observable<T>;
}
