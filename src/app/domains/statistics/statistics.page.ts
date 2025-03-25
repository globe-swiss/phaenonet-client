import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { TitleService } from '@core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDate } from '@shared/utils/formatDate';
import { axisLeft } from 'd3-axis';
import { ScaleBand, scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { Observable, Subscription } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Analytics, AnalyticsValue } from './analytics.model';
import { AnalyticsService } from './analytics.service';
import { aggregateObsWoy, createBarChart, setObsWoy30Years, setObsWoy5Years, setObsWoyCurrentYear } from './barchar';
import { allYear, AltitudeGroup } from './common.model';
import { dateToDOY, drawXAxis } from './draw';
import { StatisticFilterComponent } from './statistics-filter.component';
import { StatisticsFilterService } from './statistics-filter.service';
import { Statistics } from './statistics.model';
import { StatisticsService } from './statistics.service';
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
    StatisticFilterComponent
  ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('statisticsContainer', { static: true }) statisticsContainer: ElementRef<HTMLDivElement>;

  availableYears: number[];

  private subscriptions = new Subscription();

  private year: number | null; // null if all year
  private analytics: Analytics[] = [];
  translationsLoaded = false;

  svgComponentHeight = 0;
  displayGraph$: Observable<any>;

  constructor(
    private titleService: TitleService,
    private analyticsService: AnalyticsService,
    private statisticsService: StatisticsService,
    private masterdataService: MasterdataService,
    private translateService: TranslateService,
    private statisticsFilterService: StatisticsFilterService
  ) {}

  @HostListener('window:resize', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onResize(event: UIEvent): void {
    // re-render the svg on window resize
    this.statisticsFilterService.forceRedraw();
  }

  getColor(phenophase: string): string {
    return this.masterdataService.getColor(phenophase);
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

    const displayGraphSubscription = this.statisticsFilterService.currentFilters$
      .pipe(
        // todo fix this mess
        switchMap(filterValues => {
          const { year, datasource, analyticsType, species, phenophase, altitude, graph } = filterValues;

          // fixme wth?
          this.year = year === allYear ? null : parseInt(year, 10);

          const results =
            graph === 'yearly'
              ? this.analyticsService
                  .listByYear(year, analyticsType, datasource, species)
                  .pipe(map(result => ({ results: result, graph })))
              : this.statisticsService
                  .getStatistics(year, phenophase, altitude, species)
                  .pipe(map(result => ({ results: result, graph })));

          return results;
        }),
        // todo fix this mess
        map(({ results, graph }) => {
          if (graph === 'yearly') {
            if (this.isArrayOfAnalytics(results)) {
              this.analytics = results as Analytics[];
            }
          } else {
            setObsWoy30Years(aggregateObsWoy(results as Statistics[], 30));
            setObsWoy5Years(aggregateObsWoy(results as Statistics[], 5));
            setObsWoyCurrentYear(aggregateObsWoy(results as Statistics[], 1));
            this.svgComponentHeight = createBarChart(this.statisticsContainer);
          }
          return graph;
        }),
        // todo fix this mess
        map(graph => {
          console.log(graph);
          if (graph === 'yearly') {
            this.drawChart();
          } else {
            this.svgComponentHeight = createBarChart(this.statisticsContainer);
          }
          return graph;
        })
      )
      .subscribe();
    this.subscriptions.add(displayGraphSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private toKey(analytics: Analytics) {
    if (analytics.altitude_grp) {
      return `${analytics.species}-${analytics.altitude_grp}`;
    } else if (!this.year) {
      return `${analytics.species}-${analytics.year}`;
    } else {
      return analytics.species;
    }
  }

  private drawChart() {
    const svg = select<SVGGraphicsElement, unknown>('#statistics-graph');

    const boundingBox = svg.node()?.getBoundingClientRect();

    svg.selectAll('*').remove();

    const margin = { top: 0, right: 20, bottom: 30, left: 130 };
    const offsetLeft = this.statisticsContainer.nativeElement.offsetLeft;
    const offsetTop = this.statisticsContainer.nativeElement.offsetTop;
    const width = boundingBox.width - margin.left - margin.right;
    const xScale = scaleLinear().domain([-30, 365]).range([0, width]);
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const domain = Array.from(new Set(this.analytics.map(analytics => analytics.species)));
    const subdomain = !this.year
      ? this.availableYears
      : [...new Set(this.analytics.map(analytics => analytics.altitude_grp))].sort().reverse();

    const resultingDomain = [];
    domain.forEach(species => {
      subdomain.forEach((subdomainKey: number | AltitudeGroup) => {
        if (subdomainKey) {
          resultingDomain.push(`${species}-${subdomainKey}`);
        } else {
          resultingDomain.push(species);
        }
      });
    });

    // required height for the y-axis based on the amount of domains to display
    const requiredHeight = resultingDomain.length * 12 + margin.top + margin.bottom;
    // svg component height to fill screen without scrollbar or to the minimum required to display the y-axis
    const svgComponentHeight = Math.max(window.innerHeight - offsetTop - 5, requiredHeight);
    this.svgComponentHeight = svgComponentHeight;

    const yAxisHeight = svgComponentHeight - (margin.top + margin.bottom);
    let y = scaleBand().domain(resultingDomain).padding(0.4);
    // do not round on large domains to prevent large gaps on top/bottom of the y-axis
    if (resultingDomain.length > 30) {
      y = y.range([0, yAxisHeight]);
    } else {
      y = y.rangeRound([0, yAxisHeight]);
    }

    // Draw y-axis
    const yAxis = axisLeft(y).tickFormat(t => this.translateYAxisTick(t.toString()));
    g.append('g').call(yAxis);

    drawXAxis(g, xScale, width, margin.top, yAxisHeight);

    // draw box-plot
    this.analytics.forEach(analytics => {
      analytics.values.sort((a, b) => a.min.getTime() - b.min.getTime());
      g.selectAll('.horizontalLines')
        .data(analytics.values)
        .enter()
        .append('line')
        .attr('x1', d => xScale(dateToDOY(analytics.year, d.min)))
        .attr('x2', d => xScale(dateToDOY(analytics.year, d.max)))
        .attr('y1', _ => y(this.toKey(analytics)) + y.bandwidth() / 2)
        .attr('y2', _ => y(this.toKey(analytics)) + y.bandwidth() / 2)
        .attr('stroke', d => this.getColor(d.phenophase))
        .attr('stroke-width', 1)
        .style('opacity', 0.7)
        .attr('fill', 'none');

      this.drawVerticalLines(
        g,
        y,
        '.median',
        analytics,
        d => xScale(dateToDOY(analytics.year, d.median)),
        d => xScale(dateToDOY(analytics.year, d.median)),
        d => this.getColor(d.phenophase)
      );

      this.drawVerticalLines(
        g,
        y,
        '.whiskersMin',
        analytics,
        d => xScale(dateToDOY(analytics.year, d.min)),
        d => xScale(dateToDOY(analytics.year, d.min)),
        d => this.getColor(d.phenophase)
      );

      this.drawVerticalLines(
        g,
        y,
        '.whiskersMax',
        analytics,
        d => xScale(dateToDOY(analytics.year, d.max)),
        d => xScale(dateToDOY(analytics.year, d.max)),
        d => this.getColor(d.phenophase)
      );

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // onMouseOver needs inner as well as outer scope
      g.selectAll('.rect')
        .data(analytics.values)
        .enter()
        .append('rect')
        .attr('height', y.bandwidth())
        .attr(
          'width',
          d => xScale(dateToDOY(analytics.year, d.quantile_75)) - xScale(dateToDOY(analytics.year, d.quantile_25))
        )
        .attr('x', d => xScale(dateToDOY(analytics.year, d.quantile_25)))
        .attr('y', _ => y(this.toKey(analytics)))
        .attr('fill', d => this.getColor(d.phenophase))
        .style('opacity', 0.7)
        .attr('stroke', '#262626')
        .attr('stroke-width', 0.5)
        .on('mouseover', function (_event: MouseEvent, d: AnalyticsValue) {
          const tooltip = select('#tooltip');
          tooltip.classed('hidden', false);
          const tooltipHeight = (tooltip.node() as HTMLElement).getBoundingClientRect().height;
          const xPosition =
            parseFloat(select(this).attr('x')) + margin.left + offsetLeft - parseFloat(select(this).attr('width')) / 2;

          // Ensures the tooltip is positioned within the SVG bounds to prevent off-screen rendering and scrollbar issues, particularly in Edge.
          const yPosition = Math.min(
            parseFloat(select(this).attr('y')) + margin.top + offsetTop,
            svgComponentHeight - tooltipHeight + offsetTop
          );

          tooltip
            .style('left', `${xPosition}px`)
            .style('top', `${yPosition}px`)
            .select('#value')
            .text(`${formatShortDate(d.quantile_25)} - ${formatShortDate(d.quantile_75)}`);

          tooltip
            .style('left', `${xPosition}px`)
            .style('top', `${yPosition}px`)
            .select('#median')
            .text(`${self.translateService.instant('Median:') as string} ${formatShortDate(d.median)}`);

          self.masterdataService
            .getPhenophaseValue(analytics.species, d.phenophase)
            .pipe(
              first(),
              map(phenophase => {
                tooltip.select('#title').text(self.translateService.instant(phenophase.de) as string);
              })
            )
            .subscribe();
        })
        .on('mouseout', () => {
          select('#tooltip').classed('hidden', true);
        });
    });

    // adjust fonts
    svg.selectAll('.tick text').style('font-family', "'Open Sans', sans-serif");
  }

  private drawVerticalLines(
    g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
    y: ScaleBand<string>,
    selection: string,
    analytics: Analytics,
    x1: (d: AnalyticsValue) => number,
    x2: (d: AnalyticsValue) => number,
    color: (d: AnalyticsValue) => string
  ) {
    g.selectAll(selection)
      .data(analytics.values)
      .enter()
      .append('line')
      .attr('y1', _ => y(this.toKey(analytics)))
      .attr('y2', _ => y(this.toKey(analytics)) + y.bandwidth())
      .attr('x1', d => x1(d))
      .attr('x2', d => x2(d))
      .attr('stroke', d => color(d))
      .style('stroke-width', 1)
      .style('opacity', 0.7);
  }

  private translateYAxisTick(input: string): string {
    if (input.indexOf('-') > 0) {
      return this.translateService.instant(input.split('-')[1]) as string;
    } else {
      return this.translateService.instant(input) as string;
    }
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
