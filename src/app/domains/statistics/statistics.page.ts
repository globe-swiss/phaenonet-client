import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { TitleService } from '@core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Species } from '@shared/models/masterdata.model';
import { Observation } from '@shared/models/observation.model';
import { SourceFilterType } from '@shared/models/source-type.model';
import { ObsWoy } from '@shared/models/statistics-agg';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDate } from '@shared/utils/formatDate';
import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3Time from 'd3-time';
import moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { allSpecies, allYear, AltitudeGroup, Analytics, AnalyticsType, AnalyticsValue } from './statistics.model';
import { StatisticsService } from './statistics.service';
import { StatisticsAggService } from './statistics_agg.service';
import { StatisticsObservationsService } from './statistics_observations.service';

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
    NgIf
  ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('statisticsContainer', { static: true }) statisticsContainer: ElementRef<HTMLDivElement>;

  availableYears: number[];
  selectableYearsWithAll$: Observable<string[]>;
  selectableYearsWithoutAll$: Observable<string[]>;
  selectableDatasources: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger', 'wld'];
  selectableAnalyticsTypes: AnalyticsType[] = ['species', 'altitude'];
  selectableSpecies$: Observable<Species[]>;
  graphDisplay: string[] = ['Ergebnisdiagramm', 'Wöchentliche Beobachtungen'];
  datasetCurrentYear: ObsWoy[] = [];

  filter: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<SourceFilterType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
  }>;
  private redraw$ = new Subject();
  private subscriptions = new Subscription();

  private year: number | null; // null if all year
  private analytics: Analytics[] = [];
  private observations: Observation[] = [];
  private obsWoy: ObsWoy[] = [];
  private _displayGraph: string = '1';
  translationsLoaded = false;

  svgComponentHeight = 0;
  constructor(
    private titleService: TitleService,
    private statisticsService: StatisticsService,
    private statisticsAggService: StatisticsAggService,
    private statisticsObservationsService: StatisticsObservationsService,
    private masterdataService: MasterdataService,
    private translateService: TranslateService
  ) {}

  @HostListener('window:resize', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onResize(event: UIEvent): void {
    // re-render the svg on window resize
    if (this.displayGraph === '1') {
      this.drawChart();
    } else {
      this.createBarChart();
    }
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

    // workaround hitting issue with standalone components: https://github.com/angular/components/issues/17839
    this.subscriptions.add(
      this.translateService.get(this.selectableDatasources[0]).subscribe(() => {
        this.translationsLoaded = true;
      })
    );

    if (!this.statisticsService.statisticFilterState) {
      this.filter = new FormGroup({
        year: new FormControl(''),
        datasource: new FormControl(this.selectableDatasources[0]),
        analyticsType: new FormControl(this.selectableAnalyticsTypes[0]),
        species: new FormControl(allSpecies.id)
      });
      this.masterdataService.phenoYear$
        .pipe(first())
        .subscribe(year => this.filter.controls.year.patchValue(String(year)));
      this.statisticsService.statisticFilterState = this.filter;
    } else {
      this.filter = this.statisticsService.statisticFilterState;
    }

    this.selectableSpecies$ = this.filter.valueChanges.pipe(
      startWith(''),
      switchMap(() => this.masterdataService.getSpecies()),
      map(species => {
        const datasource = this.filter.controls.datasource.value;
        if (datasource == 'all') {
          return species;
        } else {
          // set all species if current species filter if invalid
          if (
            this.filter.controls.species.value != allSpecies.id &&
            species.filter(s => s.id == this.filter.controls.species.value && s.sources.includes(datasource)).length ==
              0
          ) {
            this.filter.controls.species.setValue(allSpecies.id);
          }
          return species.filter(s => s.sources.includes(datasource));
        }
      }),
      map(species => this.masterdataService.sortTranslatedMasterData(species)),
      map(species => [allSpecies].concat(species)),
      tap(species => {
        const formAnalyticsType = this.filter.controls.analyticsType.value;
        const formSpecies = this.filter.controls.species.value;
        const formYear = this.filter.controls.year.value;
        // set to valid single species if analytics type is 'altitude' and 'all' species is selected
        if (
          (formAnalyticsType === 'altitude' && formSpecies === allSpecies.id) ||
          (formYear === allYear && formSpecies === allSpecies.id)
        ) {
          this.filter.controls.species.setValue(species[1].id);
        }

        // anaytics type altitude is not allowed for all year view
        if (formYear === allYear && formAnalyticsType === 'altitude') {
          this.filter.controls.analyticsType.setValue('species');
        }
      }),
      tap(() => this.redraw$.next(true))
    );

    this.selectableYearsWithAll$ = this.masterdataService.availableYears$.pipe(
      tap(years => (this.availableYears = years)),
      map(years => [allYear, ...years.map(year => String(year))])
    );

    this.selectableYearsWithoutAll$ = this.masterdataService.availableYears$.pipe(
      tap(years => (this.availableYears = years)),
      map(years => years.map(year => String(year)))
    );

    this.subscriptions.add(
      this.redraw$
        .pipe(
          switchMap(() => {
            const year = this.filter.controls.year.value;
            const datasource = this.filter.controls.datasource.value;
            const analyticsType = this.filter.controls.analyticsType.value;
            const species = this.filter.controls.species.value;

            this.year = year === allYear ? null : parseInt(year, 10);

            if (this.displayGraph === '1') {
              return this.statisticsService.listByYear(year, analyticsType, datasource, species);
            } else {
              //return ({
              //  observations: this.statisticsObservationsService.getObservations(
              //    year,
              //    analyticsType,
              //    datasource,
              //    species
              //  ),
              //  obsWoy: this.statisticsAggService.getStatisticsAgg(year, analyticsType, datasource, species)
              //});
              return this.statisticsAggService.getStatisticsAgg(year, analyticsType, datasource, species);
            }
          }),
          map(results => {
            if (this.displayGraph === '1') {
              if (this.isArrayOfAnalytics(results)) {
                this.analytics = results as Analytics[];
              }
              this.drawChart();
            } else {
              console.log(results);
              this.createBarChart();
            }
          })
        )
        .subscribe()
    );
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

  private initializeWeekArray() {
    const weekCounts: ObsWoy[] = [];
    for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
      weekCounts.push({ week: weekNumber, count: 0 });
    }
    return weekCounts;
  }

  private sortDatasetPerWeek(): ObsWoy[] {
    function getISOWeek(date: Date): number {
      const tempDate = new Date(date.getTime());
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7)); // Thursday of the current week
      const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
      return Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
    const weekCounts: ObsWoy[] = this.initializeWeekArray();
    if (this.observations && this.observations.length > 0) {
      this.observations.forEach(observation => {
        const observationDate = new Date(observation.date.seconds * 1000);
        const weekNumber = getISOWeek(observationDate);
        const rightWeek = weekCounts.find(entry => entry.week === weekNumber);
        if (rightWeek) {
          rightWeek.count += 1;
        }
      });
    }
    return weekCounts;
  }

  printDataset() {
    return JSON.stringify(this.datasetCurrentYear.sort((a, b) => (a.week < b.week ? -1 : 1)));
  }
  private createBarChart(): void {
    const svg = d3.select<SVGGraphicsElement, unknown>('#app-bar-chart');

    svg.selectAll('*').remove();

    // Set dimensions and margins for the chart

    const margin = { top: 70, right: 30, bottom: 40, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Set up the x and y scales

    const x = d3.scaleLinear().range([0, width]);

    const y = d3.scaleLinear().range([height, 0]);

    const xBar = d3.scaleBand().range([0, width]).padding(0.4);

    // Create the SVG element and append it to the chart container

    svg
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const dataset5Years: ObsWoy[] = [
      { week: 1, count: 140 },
      { week: 2, count: 280 },
      { week: 3, count: 830 },
      { week: 4, count: 200 },
      { week: 5, count: 380 },
      { week: 6, count: 280 },
      { week: 7, count: 520 },
      { week: 8, count: 530 },
      { week: 9, count: 420 },
      { week: 10, count: 320 },
      { week: 11, count: 430 },
      { week: 12, count: 580 },
      { week: 13, count: 320 },
      { week: 14, count: 930 },
      { week: 15, count: 390 },
      { week: 16, count: 770 },
      { week: 17, count: 780 },
      { week: 18, count: 820 },
      { week: 19, count: 640 },
      { week: 20, count: 510 },
      { week: 21, count: 420 },
      { week: 22, count: 520 },
      { week: 23, count: 430 },
      { week: 24, count: 580 },
      { week: 25, count: 290 },
      { week: 26, count: 90 },
      { week: 27, count: 100 },
      { week: 28, count: 470 },
      { week: 29, count: 580 },
      { week: 30, count: 280 },
      { week: 31, count: 360 },
      { week: 32, count: 220 },
      { week: 33, count: 230 },
      { week: 34, count: 240 },
      { week: 35, count: 820 },
      { week: 36, count: 910 },
      { week: 37, count: 710 },
      { week: 38, count: 820 },
      { week: 39, count: 580 },
      { week: 40, count: 530 },
      { week: 41, count: 640 },
      { week: 42, count: 720 },
      { week: 43, count: 330 },
      { week: 44, count: 340 },
      { week: 45, count: 290 },
      { week: 46, count: 530 },
      { week: 47, count: 640 },
      { week: 48, count: 330 },
      { week: 49, count: 420 },
      { week: 50, count: 510 },
      { week: 51, count: 430 },
      { week: 52, count: 440 }
    ];
    const dataset20Years: ObsWoy[] = [
      { week: 1, count: 500 },
      { week: 2, count: 750 },
      { week: 3, count: 280 },
      { week: 4, count: 100 },
      { week: 5, count: 980 },
      { week: 6, count: 420 },
      { week: 7, count: 500 },
      { week: 8, count: 250 },
      { week: 9, count: 180 },
      { week: 10, count: 500 },
      { week: 11, count: 680 },
      { week: 12, count: 500 },
      { week: 13, count: 750 },
      { week: 14, count: 280 },
      { week: 15, count: 100 },
      { week: 16, count: 980 },
      { week: 17, count: 420 },
      { week: 18, count: 500 },
      { week: 19, count: 250 },
      { week: 20, count: 180 },
      { week: 21, count: 500 },
      { week: 22, count: 680 },
      { week: 23, count: 500 },
      { week: 24, count: 750 },
      { week: 25, count: 280 },
      { week: 26, count: 100 },
      { week: 27, count: 980 },
      { week: 28, count: 420 },
      { week: 29, count: 500 },
      { week: 30, count: 250 },
      { week: 31, count: 180 },
      { week: 32, count: 500 },
      { week: 33, count: 680 },
      { week: 34, count: 500 },
      { week: 35, count: 750 },
      { week: 36, count: 280 },
      { week: 37, count: 100 },
      { week: 38, count: 980 },
      { week: 39, count: 420 },
      { week: 40, count: 500 },
      { week: 41, count: 250 },
      { week: 42, count: 180 },
      { week: 43, count: 500 },
      { week: 44, count: 680 },
      { week: 45, count: 500 },
      { week: 46, count: 750 },
      { week: 47, count: 280 },
      { week: 48, count: 100 },
      { week: 49, count: 980 },
      { week: 50, count: 420 },
      { week: 51, count: 500 },
      { week: 52, count: 250 }
    ];
    this.datasetCurrentYear = this.sortDatasetPerWeek();

    // Define the x and y domains
    x.domain([1, 53]).range([0, width]);
    xBar.domain(
      this.datasetCurrentYear.map(function (d) {
        return d.week.toString();
      })
    );
    y.domain([0, d3.max([...dataset5Years, ...dataset20Years, ...this.datasetCurrentYear], d => d.count)]);

    const barWidth = width / this.datasetCurrentYear.length - 10;
    // Add the x-axis

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));

    // Add the y-axis

    svg.append('g').call(d3.axisLeft(y));

    // Create the area generator
    const area = d3
      .area<ObsWoy>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.week))
      .y0(height)
      .y1(d => y(d.count));

    // Add the line path to the SVG element

    //    svg
    //      .append('path')
    //      .datum(dataset5Years)
    //      .attr('class', 'area')
    //      .attr('fill', 'steelblue')
    //      .attr('opacity', '0.5')
    //      .attr('d', area);
    //
    //    svg
    //      .append('path')
    //      .datum(dataset20Years)
    //      .attr('class', 'area')
    //      .attr('fill', 'pink')
    //      .attr('opacity', '0.5')
    //      .attr('d', area);
    //
    svg
      .selectAll('.bar')
      .data(this.datasetCurrentYear)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return x(d.week);
      })
      .attr('y', function (d) {
        return y(d.count);
      })
      .attr('width', barWidth)
      .attr('height', function (d) {
        return height - y(d.count);
      })
      .attr('fill', 'red')
      .attr('opacity', '0.6');
  }

  private drawChart() {
    const svg = d3.select<SVGGraphicsElement, unknown>('#statistics-graph');

    const boundingBox = svg.node()?.getBoundingClientRect();

    svg.selectAll('*').remove();

    const margin = { top: 0, right: 20, bottom: 30, left: 130 };
    const offsetLeft = this.statisticsContainer.nativeElement.offsetLeft;
    const offsetTop = this.statisticsContainer.nativeElement.offsetTop;
    const width = boundingBox.width - margin.left - margin.right;
    const xScale = d3Scale.scaleLinear().domain([-30, 365]).range([0, width]);
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
    let y = d3Scale.scaleBand().domain(resultingDomain).padding(0.4);
    // do not round on large domains to prevent large gaps on top/bottom of the y-axis
    if (resultingDomain.length > 30) {
      y = y.range([0, yAxisHeight]);
    } else {
      y = y.rangeRound([0, yAxisHeight]);
    }

    // Draw y-axis
    const yAxis = d3Axis.axisLeft(y).tickFormat(t => this.translateYAxisTick(t.toString()));
    g.append('g').call(yAxis);

    // Draw x-axis
    const tickYear = this.masterdataService.getPhenoYear();
    const xTicks = d3Time
      .timeMonths(new Date(tickYear - 1, 11, 1), new Date(tickYear, 11, 31))
      .map(d => this.dateToDOY(tickYear, d));

    const xAxisTicks = d3Axis
      .axisBottom(xScale)
      .tickValues(xTicks)
      .tickFormat(_ => '');

    const xAxisLabels = d3Axis
      .axisBottom(xScale)
      .tickValues(xTicks.map(tickValue => tickValue + 15)) // put labels on the 15th of each month
      .tickSize(0)
      .tickPadding(5)
      .tickFormat(t =>
        moment()
          .dayOfYear(+t)
          .format(width >= 740 ? 'MMMM' : 'MM')
      );
    g.append('g').attr('transform', `translate(0, ${yAxisHeight})`).call(xAxisTicks);
    g.append('g').attr('transform', `translate(0, ${yAxisHeight})`).call(xAxisLabels);

    // draw x-axis helper lines
    g.selectAll('.tickGrid')
      .data(xTicks.slice(1))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d.valueOf()))
      .attr('x2', d => xScale(d.valueOf()))
      .attr('y1', _ => 0)
      .attr('y2', _ => yAxisHeight)
      .attr('stroke', _ => 'grey')
      .attr('stroke-width', 0.2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 1)
      .attr('fill', 'none');

    // draw box-plot
    this.analytics.forEach(analytics => {
      analytics.values.sort((a, b) => a.min.getTime() - b.min.getTime());
      g.selectAll('.horizontalLines')
        .data(analytics.values)
        .enter()
        .append('line')
        .attr('x1', d => xScale(this.dateToDOY(analytics.year, d.min)))
        .attr('x2', d => xScale(this.dateToDOY(analytics.year, d.max)))
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
        d => xScale(this.dateToDOY(analytics.year, d.median)),
        d => xScale(this.dateToDOY(analytics.year, d.median)),
        d => this.getColor(d.phenophase)
      );

      this.drawVerticalLines(
        g,
        y,
        '.whiskersMin',
        analytics,
        d => xScale(this.dateToDOY(analytics.year, d.min)),
        d => xScale(this.dateToDOY(analytics.year, d.min)),
        d => this.getColor(d.phenophase)
      );

      this.drawVerticalLines(
        g,
        y,
        '.whiskersMax',
        analytics,
        d => xScale(this.dateToDOY(analytics.year, d.max)),
        d => xScale(this.dateToDOY(analytics.year, d.max)),
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
          d =>
            xScale(this.dateToDOY(analytics.year, d.quantile_75)) -
            xScale(this.dateToDOY(analytics.year, d.quantile_25))
        )
        .attr('x', d => xScale(this.dateToDOY(analytics.year, d.quantile_25)))
        .attr('y', _ => y(this.toKey(analytics)))
        .attr('fill', d => this.getColor(d.phenophase))
        .style('opacity', 0.7)
        .attr('stroke', '#262626')
        .attr('stroke-width', 0.5)
        .on('mouseover', function (_event: MouseEvent, d: AnalyticsValue) {
          const tooltip = d3.select('#tooltip');
          tooltip.classed('hidden', false);
          const tooltipHeight = (tooltip.node() as HTMLElement).getBoundingClientRect().height;
          const xPosition =
            parseFloat(d3.select(this).attr('x')) +
            margin.left +
            offsetLeft -
            parseFloat(d3.select(this).attr('width')) / 2;

          // Ensures the tooltip is positioned within the SVG bounds to prevent off-screen rendering and scrollbar issues, particularly in Edge.
          const yPosition = Math.min(
            parseFloat(d3.select(this).attr('y')) + margin.top + offsetTop,
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
          d3.select('#tooltip').classed('hidden', true);
        });
    });

    // adjust fonts
    svg.selectAll('.tick text').style('font-family', "'Open Sans', sans-serif");
  }

  private drawVerticalLines(
    g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
    y: d3Scale.ScaleBand<string>,
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

  private dateToDOY(year: number, value: Date) {
    const m = moment(value);
    const lastDateOfAnalytics = moment({ year: year }).endOf('year');

    if (m.year() - lastDateOfAnalytics.year() < 0) {
      // date lies in the past year or beyond
      return m.dayOfYear() - lastDateOfAnalytics.dayOfYear() + 1;
    } else if (m.year() - lastDateOfAnalytics.year() > 0) {
      // date lies in the next year
      return m.dayOfYear() + lastDateOfAnalytics.dayOfYear();
    } else {
      return m.dayOfYear();
    }
  }

  // Getter and Setter for displayGraph
  get displayGraph(): string {
    return this._displayGraph;
  }

  set displayGraph(value: string) {
    if (this._displayGraph !== value) {
      this._displayGraph = value;
      this.redraw$.next(true);
    }
  }
}
