import { Observable } from 'rxjs';

export interface ResourceService<T> {
  upsert(t: T, id: string): Observable<T>;

  get(id: string, withId?: boolean): Observable<T>;
}
