import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Analytics } from './analytics.model';
import { StatisticFilterComponent } from './statistics-filter.component';
import { FilterGraphType } from './statistics-filter.model';
import { StatisticsFilterService } from './statistics-filter.service';
import { WeeklyStatisticsComponent } from './weekly-statistics.component';
import { YearlyStatisticsComponent } from './yearly-statistics.component';
@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AsyncPipe,
    TranslateModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    StatisticFilterComponent,
    YearlyStatisticsComponent,
    WeeklyStatisticsComponent
  ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  redraw$ = new BehaviorSubject(0);
  currentGraph$: Observable<FilterGraphType>;

  constructor(
    private titleService: TitleService,
    private statisticsFilterService: StatisticsFilterService
  ) {}

  @HostListener('window:resize', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onResize(event: UIEvent): void {
    // re-render the svg on window resize
    this.redraw$.next(this.redraw$.value + 1);
  }

  isAnalytics(obj: any): obj is Analytics {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'source' in obj &&
      'species' in obj &&
      'type' in obj &&
      'altitude_grp' in obj &&
      'year' in obj &&
      'values' in obj
    );
  }

  isArrayOfAnalytics(obj: any): boolean {
    if (Array.isArray(obj)) {
      return obj.every(item => this.isAnalytics(item));
    } else return false;
  }

  ngOnInit(): void {
    this.titleService.setLocation('Auswertungen');

    this.currentGraph$ = this.statisticsFilterService.currentFilters$.pipe(map(({ graph }) => graph));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
