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
import { FilterGraphType } from './feature-statistics-filter/statistics-filter.model';
import { StatisticFilterComponent } from './feature-statistics-filter/statistics-filter.widget';
import { WeeklyGraphComponent } from './feature-weekly-graph/weekly-graph.widget';
import { YearlyGraphComponent } from './feature-yearly-graph/yearly-graph.widget';
import { StatisticsFilterService } from './shared/statistics-filter.service';
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
    YearlyGraphComponent,
    WeeklyGraphComponent
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

  ngOnInit(): void {
    this.titleService.setLocation('Auswertungen');
    this.currentGraph$ = this.statisticsFilterService.currentFilters$.pipe(map(({ graph }) => graph));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
