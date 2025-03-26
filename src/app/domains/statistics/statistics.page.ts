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
import { BehaviorSubject, Subscription } from 'rxjs';
import { Analytics } from './analytics.model';
import { StatisticFilterComponent } from './statistics-filter.component';
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
    YearlyStatisticsComponent
  ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  redraw$ = new BehaviorSubject(0);

  constructor(private titleService: TitleService) {}

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

    // const displayGraphSubscription = this.statisticsFilterService.currentFilters$
    //   .pipe(
    //     // todo fix this mess
    //     switchMap(({ year, datasource, analyticsType, species, phenophase, altitude, graph }) => {
    //       // fixme wth?
    //       this.year = year === allYear ? null : +year;

    //       const results =
    //         graph === 'yearly'
    //           ? this.analyticsService
    //               .listByYear(year, analyticsType, datasource, species)
    //               .pipe(map(result => ({ results: result, graph })))
    //           : this.statisticsService
    //               .getStatistics(year, phenophase, altitude, species)
    //               .pipe(map(result => ({ results: result, graph })));

    //       return results;
    //     }),
    //     // todo fix this mess
    //     map(({ results, graph }) => {
    //       if (graph === 'yearly') {
    //         if (this.isArrayOfAnalytics(results)) {
    //           this.analytics = results as Analytics[];
    //         }
    //       } else {
    //         setObsWoy30Years(aggregateObsWoy(results as Statistics[], 30));
    //         setObsWoy5Years(aggregateObsWoy(results as Statistics[], 5));
    //         setObsWoyCurrentYear(aggregateObsWoy(results as Statistics[], 1));
    //         this.svgComponentHeight = createBarChart(this.statisticsContainer);
    //       }
    //       return graph;
    //     }),
    //     // todo fix this mess
    //     map(graph => {
    //       console.log(graph);
    //       if (graph === 'yearly') {
    //         this.drawChart();
    //       } else {
    //         this.svgComponentHeight = createBarChart(this.statisticsContainer);
    //       }
    //       return graph;
    //     })
    //   )
    //   .subscribe();
    //this.subscriptions.add(displayGraphSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // // Getter and Setter for displayGraph
  // get displayGraph(): string {
  //   return this._displayGraph;
  // }

  // set displayGraph(value: string) {
  //   if (this._displayGraph !== value) {
  //     this._displayGraph = value;
  //     this.redraw$.next(true);
  //     if (this._displayGraph === '1') {
  //       // TODO: fixme, just a quickfix to keep original behaviour
  //       this.selectableYears$ = this.selectableYearsWithAll$;
  //     } else {
  //       this.selectableYears$ = this.selectableYearsWithoutAll$;
  //       if (this.filter.controls.year.value === allYear) {
  //         this.filter.controls.year.setValue(this.availableYears[0].toString());
  //       }
  //     }
  //   }
  // }
}
