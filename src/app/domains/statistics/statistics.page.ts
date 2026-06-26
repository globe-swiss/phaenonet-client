import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { StatisticFilterComponent } from './feature-statistics-filter/statistics-filter.widget';
import { WeeklyGraphComponent } from './feature-weekly-graph/weekly-graph.widget';
import { YearlyGraphComponent } from './feature-yearly-graph/yearly-graph.widget';
import { FilterGraphType } from './shared/statistics-filter.model';
import { StatisticsFilterService } from './shared/statistics-filter.service';
@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    TranslateModule,
    StatisticFilterComponent,
    YearlyGraphComponent,
    WeeklyGraphComponent
  ]
})
export class StatisticsComponent implements OnInit {
  private titleService = inject(TitleService);
  private statisticsFilterService = inject(StatisticsFilterService);

  currentGraph$: Observable<FilterGraphType>;

  ngOnInit(): void {
    this.titleService.setLocation('Auswertungen');
    this.currentGraph$ = this.statisticsFilterService.currentFilters$.pipe(map(({ graph }) => graph));
  }
}
