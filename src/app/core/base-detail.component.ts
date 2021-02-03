import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, ReplaySubject, Subscription, of, throwError } from 'rxjs';
import { flatMap, switchMap, tap } from 'rxjs/operators';

import { ResourceService } from './resource.service';

@Directive()
export class BaseDetailComponent<T> implements OnInit, OnDestroy {
  private baseSubscriptions = new Subscription();
  detailSubject$: ReplaySubject<T> = new ReplaySubject<T>(1);
  detailId: string;

  constructor(
    protected resourceService: ResourceService<T>,
    protected route: ActivatedRoute,
    protected router: Router
  ) {}

  ngOnInit(): void {
    this.baseSubscriptions.add(
      this.getDetailId()
        .pipe(
          switchMap((id: string) => {
            return this.getDetailSubject(id);
          }),
          tap(id => {
            if (!id) {
              this.router.navigate(['/404'], { skipLocationChange: true });
            }
          })
        )
        .subscribe(this.detailSubject$)
    );
  }

  ngOnDestroy(): void {
    this.baseSubscriptions.unsubscribe();
  }

  getRouteParam(param: string): Observable<string> {
    return this.getParam(this.route, param);
  }

  getParentRouteParam(param: string): Observable<string> {
    if (this.route.parent) {
      return this.getParam(this.route.parent, param);
    } else {
      return throwError('parent route param does not exist');
    }
  }

  private getDetailSubject(id: string) {
    if ('new' === id) {
      return of<T>({} as T);
    } else {
      this.detailId = id;
      return this.resourceService.get(this.detailId);
    }
  }

  protected getDetailId(): Observable<string> {
    if (this.detailId == null) {
      return this.getRouteParam('id');
    } else {
      return of(this.detailId);
    }
  }

  private getParam(route: ActivatedRoute, param: string): Observable<string> {
    return route.paramMap.pipe(
      flatMap((params: ParamMap) => {
        const p = params.get(param);
        if (p) {
          return of(p);
        } else {
          return throwError('param does not exist');
        }
      })
    );
  }
}
