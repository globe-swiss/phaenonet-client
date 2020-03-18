import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UserService } from '../auth/user.service';
import { BaseDetailComponent } from '../core/base-detail.component';
import { AlertService } from '../messaging/alert.service';
import { Individual } from './individual';
import { IndividualService } from './individual.service';

export abstract class BaseIndividualDetailComponent extends BaseDetailComponent<Individual> {
  constructor(
    protected route: ActivatedRoute,
    protected individualService: IndividualService,
    protected userService: UserService,
    protected alertService: AlertService
  ) {
    super(individualService, route);
  }

  follow(): void {
    this.individualToFollow().subscribe(f =>
      this.userService
        .followIndividual(f)
        .pipe(first())
        .subscribe(_ => {
          this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Objekts abonniert.');
        })
    );
  }

  unfollow(): void {
    this.individualToFollow().subscribe(f =>
      this.userService
        .unfollowIndividual(f)
        .pipe(first())
        .subscribe(_ => {
          this.alertService.infoMessage(
            'Aktivitäten gekündigt',
            'Sie erhalten keine Aktivitäten mehr zu diesem Objekt.'
          );
        })
    );
  }

  private individualToFollow(): Observable<string> {
    return this.detailSubject.pipe(
      first(),
      map(i => i.individual)
    );
  }
}
