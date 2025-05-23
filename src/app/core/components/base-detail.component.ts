import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BaseResourceService } from '@core/services/base-resource.service';
import { Observable, of, ReplaySubject, Subscription, throwError } from 'rxjs';
import { filter, mergeMap, switchMap, tap } from 'rxjs/operators';

@Directive()
export class BaseDetailComponent<T> implements OnInit, OnDestroy {
  private baseSubscriptions = new Subscription();
  detailSubject$: ReplaySubject<T> = new ReplaySubject<T>(1);
  detailId: string;

  constructor(
    protected resourceService: BaseResourceService<T>,
    protected route: ActivatedRoute,
    protected router: Router
  ) {}

  ngOnInit(): void {
    this.baseSubscriptions.add(
      this.getDetailId()
        .pipe(
          switchMap(id => this.getDetailSubject(id)),
          tap(subject => {
            if (!subject) {
              void this.router.navigate(['/404'], { skipLocationChange: true });
            }
          }),
          filter(subject => !!subject) // do not publish undefined values (after subject deletion)
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
      return throwError(() => new Error('parent route param does not exist'));
    }
  }

  private getDetailSubject(id: string) {
    if ('new' === id) {
      return of<T>({} as T);
    } else {
      this.detailId = id;
      return this.resourceService.get(this.detailId, true); // get detail subject or null values to enable navigation to 404 page
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
      mergeMap((params: ParamMap) => {
        const p = params.get(param);
        if (p) {
          return of(p);
        } else {
          return throwError(() => new Error('param does not exist'));
        }
      })
    );
  }
}
