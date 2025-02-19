import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
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
import { Phenophase, Species } from '@shared/models/masterdata.model';
import { SourceFilterType } from '@shared/models/source-type.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDate } from '@shared/utils/formatDate';
import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3Time from 'd3-time';
import moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { combineLatestWith, first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Statistics } from '../../shared/models/statistics';
import { StatisticsAgg } from './../../shared/models/statistics';
import { AnalyticsService } from './analytics.service';
import {
  aggregateObsWoy,
  aggregateObsWoyStatistics,
  createBarChart,
  setObsWoy30Years,
  setObsWoy5Years,
  setObsWoyCurrentYear,
  setXTickInterval
} from './barchar';
import {
  allPhenophases,
  allSpecies,
  allYear,
  AltitudeFilterGroup,
  AltitudeGroup,
  Analytics,
  AnalyticsType,
  AnalyticsValue
} from './statistics.model';
import { StatisticsService } from './statistics.service';
import { StatisticsAggService } from './statistics_agg.service';
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
    NgSwitchCase
  ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('statisticsContainer', { static: true }) statisticsContainer: ElementRef<HTMLDivElement>;

  availableYears: number[];
  selectableYears$: Observable<string[]>;
  selectableYearsWithAll$: Observable<string[]>;
  selectableYearsWithoutAll$: Observable<string[]>;
  selectableDatasources: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger', 'wld'];
  selectableAnalyticsTypes: AnalyticsType[] = ['species', 'altitude'];
  selectableSpecies$: Observable<Species[]>;
  selectablePhenophases: Phenophase[];
  selectableAltitudeGroup: AltitudeFilterGroup[] = ['all', 'alt1', 'alt2', 'alt3', 'alt4', 'alt5'];
  filter: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<SourceFilterType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
    phenophase: FormControl<Phenophase>;
    altitude: FormControl<AltitudeFilterGroup>;
  }>;
  graphFilter: FormGroup<{
    graph: FormControl<number>;
  }>;

  private redraw$ = new Subject();
  private subscriptions = new Subscription();

  private year: number | null; // null if all year
  private analytics: Analytics[] = [];
  private _displayGraph: string = '1';
  translationsLoaded = false;

  //TODO: flag to enable and disable the observation graph
  showSecondGraph = true;

  svgComponentHeight = 0;
  constructor(
    private titleService: TitleService,
    private analyticsService: AnalyticsService,
    private statisticsService: StatisticsService,
    private statisticsAggService: StatisticsAggService,
    private masterdataService: MasterdataService,
    private translateService: TranslateService,
    private breakpointObserver: BreakpointObserver
  ) {}

  @HostListener('window:resize', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onResize(event: UIEvent): void {
    // re-render the svg on window resize
    if (this.displayGraph === '1') {
      this.drawChart();
    } else {
      this.svgComponentHeight = createBarChart(this.statisticsContainer);
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
    this.subscriptions.add(
      this.breakpointObserver.observe([Breakpoints.TabletPortrait, Breakpoints.Handset]).subscribe(result => {
        console.log(result);

        if (result.matches) {
          setXTickInterval(5); // Mobile view
        } else {
          setXTickInterval(1); // Desktop view
        }
      })
    );
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
        species: new FormControl(allSpecies.id),
        phenophase: new FormControl(allPhenophases),
        altitude: new FormControl(this.selectableAltitudeGroup[0])
      });
      this.masterdataService.phenoYear$
        .pipe(first())
        .subscribe(year => this.filter.controls.year.patchValue(String(year)));
      this.analyticsService.statisticFilterState = this.filter;
    } else {
      this.filter = this.analyticsService.statisticFilterState;
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
          formSpecies === allSpecies.id &&
          (formAnalyticsType === 'altitude' || formYear === allYear || this.displayGraph === '2')
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

    this.filter.controls.species.valueChanges
      .pipe(
        switchMap(species =>
          this.masterdataService.getPhenophases(species).pipe(
            map(phenophases => [allPhenophases, ...phenophases]) // Add "All Phenophases"
          )
        )
      )
      .subscribe(species => {
        this.selectablePhenophases = species;
        this.filter.controls.phenophase.setValue(allPhenophases);
      });

    this.selectableYearsWithAll$ = this.masterdataService.availableYears$.pipe(
      tap(years => (this.availableYears = years)),
      map(years => [allYear, ...years.map(year => String(year))])
    );

    this.selectableYearsWithoutAll$ = this.masterdataService.availableYears$.pipe(
      tap(years => (this.availableYears = years)),
      map(years => years.map(year => String(year)))
    );

    this.selectableYears$ = this.selectableYearsWithAll$;

    this.subscriptions.add(
      this.redraw$
        .pipe(
          switchMap(() => {
            const year = this.filter.controls.year.value;
            const datasource = this.filter.controls.datasource.value;
            const analyticsType = this.filter.controls.analyticsType.value;
            const species = this.filter.controls.species.value;
            const phenophase = this.filter.controls.phenophase.value;
            const altitude = this.filter.controls.altitude.value;

            this.year = year === allYear ? null : parseInt(year, 10);

            if (this.displayGraph === '1') {
              return this.analyticsService.listByYear(year, analyticsType, datasource, species);
            } else {
              return this.statisticsAggService
                .getStatisticsAgg(year, phenophase, altitude, species)
                .pipe(combineLatestWith(this.statisticsService.getStatistics(year, phenophase, altitude, species)));
            }
          }),
          map(results => {
            if (this.displayGraph === '1') {
              if (this.isArrayOfAnalytics(results)) {
                this.analytics = results as Analytics[];
              }
              this.drawChart();
            } else {
              setObsWoy30Years(aggregateObsWoy(results[0] as StatisticsAgg[], 30));
              setObsWoy5Years(aggregateObsWoy(results[0] as StatisticsAgg[], 5));
              setObsWoyCurrentYear(aggregateObsWoyStatistics(results[1] as Statistics[], 1));
              this.svgComponentHeight = createBarChart(this.statisticsContainer);
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
    const tickYear = 1900; // any year
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

  private dateToDOY(year: number, date: Date) {
    const mdate = moment(date);

    if (mdate.year() < year) {
      // date lies in the past year or beyond
      return (
        mdate.dayOfYear() -
        moment({ year: year - 1 })
          .endOf('year')
          .dayOfYear()
      );
    } else if (mdate.year() > year) {
      // date lies in the next year
      return mdate.dayOfYear() + moment({ year: year }).endOf('year').dayOfYear();
    } else {
      return mdate.dayOfYear();
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
      if (this._displayGraph === '1') {
        // TODO: fixme, just a quickfix to keep original behaviour
        this.selectableYears$ = this.selectableYearsWithAll$;
      } else {
        this.selectableYears$ = this.selectableYearsWithoutAll$;
        if (this.filter.controls.year.value === allYear) {
          this.filter.controls.year.setValue(this.availableYears[0].toString());
        }
      }
    }
  }
}
