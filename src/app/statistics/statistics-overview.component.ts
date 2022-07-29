import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3 from 'd3-selection';
import * as d3Time from 'd3-time';
import moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { FormPersistenceService } from '../core/form-persistence.service';
import { NavService } from '../core/nav/nav.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { SourceFilterType } from '../masterdata/source-type';
import { Species } from '../masterdata/species';
import { Observation } from '../observation/observation';
import { formatShortDate } from '../shared/formatDate';
import { Analytics } from './analytics';
import { AnalyticsType } from './analytics-type';
import { AnalyticsValue } from './analytics-value';
import { StatisticsService } from './statistics.service';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ObservationData {
  species: string;
  groupedByPhenophase: GroupedByPhenophaseGroup[];
}

export interface GroupedByPhenophaseGroup {
  phenophaseGroup: string;
  observations: Observation[];
}

const allSpecies = { id: 'all', de: 'Alle' } as Species;
const allYear = 'all';

@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './statistics-overview.component.html',
  styleUrls: ['./statistics-overview.component.scss']
})
export class StatisticsOverviewComponent implements OnInit, OnDestroy {
  @ViewChild('statisticsContainer', { static: true }) statisticsContainer: ElementRef;

  availableYears: number[];
  selectableYears$: Observable<string[]>;
  selectableDatasources: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger', 'wld'];
  selectableAnalyticsTypes: AnalyticsType[] = ['species', 'altitude'];
  selectableSpecies$: Observable<Species[]>;

  selectedYear: AbstractControl;
  filter: UntypedFormGroup;
  private redraw$ = new Subject();
  private subscription = new Subscription();

  private margin: Margin = { top: 20, right: 20, bottom: 30, left: 160 };

  private width: number;
  private height: number;

  private offsetLeft: number;
  private offsetTop: number;

  private svg: any;

  private x: any;
  private y: any;
  private g: any;

  private year: number | null; // null if all year
  private data: Analytics[];

  constructor(
    private navService: NavService,
    private statisticsService: StatisticsService,
    private masterdataService: MasterdataService,
    private formPersistanceService: FormPersistenceService,
    private translateService: TranslateService,
    private analytics: AngularFireAnalytics
  ) {}

  @HostListener('window:resize', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onResize(event: UIEvent): void {
    // re-render the svg on window resize
    this.drawChart();
  }

  getColor(phenophase: string): string {
    return this.masterdataService.getColor(phenophase);
  }

  ngOnInit(): void {
    this.navService.setLocation('Auswertungen');
    void this.analytics.logEvent('statistics.view');

    if (!this.formPersistanceService.statisticFilter) {
      this.selectedYear = new UntypedFormControl();
      this.filter = new UntypedFormGroup({
        year: this.selectedYear,
        datasource: new UntypedFormControl(this.selectableDatasources[0]),
        analyticsType: new UntypedFormControl(this.selectableAnalyticsTypes[0]),
        species: new UntypedFormControl(allSpecies.id)
      });
      this.masterdataService.phenoYear$.pipe(first()).subscribe(year => this.selectedYear.patchValue(String(year)));
      this.formPersistanceService.statisticFilter = this.filter;
    } else {
      this.filter = this.formPersistanceService.statisticFilter;
      this.selectedYear = this.formPersistanceService.statisticFilter.controls.year;
    }

    this.selectableSpecies$ = this.filter.valueChanges.pipe(
      startWith(''),
      switchMap(() => this.masterdataService.getSpecies()),
      map(species => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        const formAnalyticsType = this.filter.controls.analyticsType.value as AnalyticsType;
        const formSpecies = this.filter.controls.species.value as string;
        const formYear = this.filter.controls.year.value as string;
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
      tap(() => this.redraw$.next())
    );

    this.selectableYears$ = this.masterdataService.availableYears$.pipe(
      tap(years => (this.availableYears = years)),
      map(years => [allYear, ...years.map(year => String(year))])
    );

    this.subscription.add(
      this.redraw$
        .pipe(
          switchMap(() => {
            const year = this.filter.controls.year.value as string;
            const datasource = this.filter.controls.datasource.value as SourceFilterType;
            const analyticsType = this.filter.controls.analyticsType.value as AnalyticsType;
            const species = this.filter.controls.species.value as string;

            this.year = year === allYear ? null : parseInt(year, 10);

            // only report an event if filter is not the default
            if (this.year !== this.masterdataService.getPhenoYear() || datasource !== 'all' || species !== 'all') {
              void this.analytics.logEvent('statistics.filter', {
                year: this.year,
                source: datasource,
                species: species,
                type: analyticsType,
                current: this.year === this.masterdataService.getPhenoYear()
              });
            }
            return this.statisticsService.listByYear(year, analyticsType, datasource, species);
          }),
          map(results => {
            this.data = results;
            this.drawChart();
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    this.svg = d3.select('svg');

    this.svg.selectAll('*').remove();

    this.offsetLeft = this.statisticsContainer.nativeElement.offsetLeft;
    this.offsetTop = this.statisticsContainer.nativeElement.offsetTop;

    this.width = this.statisticsContainer.nativeElement.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.statisticsContainer.nativeElement.offsetHeight - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.x = d3Scale.scaleLinear().domain([-30, 395]).range([0, this.width]).nice();

    const domain = this.data.map(analytics => analytics.species);
    const subdomain = !this.year
      ? this.availableYears
      : [...new Set(this.data.map(analytics => analytics.altitude_grp))].sort().reverse();

    const resultingDomain = [];
    domain.forEach(species => {
      subdomain.forEach(subdomainKey => {
        if (subdomainKey) {
          resultingDomain.push(`${species}-${subdomainKey}`);
        } else {
          resultingDomain.push(species);
        }
      });
    });

    this.y = d3Scale.scaleBand().domain(resultingDomain).rangeRound([0, this.height]).padding(0.4);

    this.data.forEach(analytics => {
      this.g
        .selectAll('.horizontalLines')
        .data(analytics.values)
        .enter()
        .append('line')
        .attr('x1', d => this.x(this.toX(analytics.year, d.min)))
        .attr('x2', d => this.x(this.toX(analytics.year, d.max)))
        .attr('y1', d => this.y(this.toKey(analytics)) + this.y.bandwidth() / 2)
        .attr('y2', d => this.y(this.toKey(analytics)) + this.y.bandwidth() / 2)
        .attr('stroke', d => this.getColor(d.phenophase))
        .attr('stroke-width', 1)
        .style('opacity', 0.7)
        .attr('fill', 'none');

      this.drawVerticalLines(
        '.median',
        analytics,
        d => this.x(this.toX(analytics.year, d.median)),
        d => this.x(this.toX(analytics.year, d.median)),
        d => this.getColor(d.phenophase)
      );

      this.drawVerticalLines(
        '.whiskersMin',
        analytics,
        d => this.x(this.toX(analytics.year, d.min)),
        d => this.x(this.toX(analytics.year, d.min)),
        d => this.getColor(d.phenophase)
      );

      this.drawVerticalLines(
        '.whiskersMax',
        analytics,
        d => this.x(this.toX(analytics.year, d.max)),
        d => this.x(this.toX(analytics.year, d.max)),
        d => this.getColor(d.phenophase)
      );

      const self = this;
      this.g
        .selectAll('.rect')
        .data(analytics.values)
        .enter()
        .append('rect')
        .attr('height', this.y.bandwidth())
        .attr(
          'width',
          d => this.x(this.toX(analytics.year, d.quantile_75)) - this.x(this.toX(analytics.year, d.quantile_25))
        )
        .attr('x', d => this.x(this.toX(analytics.year, d.quantile_25)))
        .attr('y', d => this.y(this.toKey(analytics)))
        .attr('fill', d => this.getColor(d.phenophase))
        .style('opacity', 0.7)
        .attr('stroke', '#262626')
        .attr('stroke-width', 0.5)
        .on('mouseover', function (d) {
          const xPosition =
            parseFloat(d3.select(this).attr('x')) +
            self.margin.left +
            self.offsetLeft -
            parseFloat(d3.select(this).attr('width')) / 2;

          const yPosition = parseFloat(d3.select(this).attr('y')) + self.margin.top + self.offsetTop;

          d3.select('#tooltip')
            .style('left', xPosition + 'px')
            .style('top', yPosition + 'px')
            .select('#value')
            .text('' + formatShortDate(d.quantile_25) + ' - ' + formatShortDate(d.quantile_75));

          d3.select('#tooltip')
            .style('left', xPosition + 'px')
            .style('top', yPosition + 'px')
            .select('#median')
            .text(self.translateService.instant('Median:') + ' ' + formatShortDate(d.median));

          self.masterdataService
            .getPhenophaseValue(analytics.species, d.phenophase)
            .pipe(
              first(),
              map(phenophase => {
                d3.select('#tooltip').select('#title').text(self.translateService.instant(phenophase.de));

                d3.select('#tooltip').classed('hidden', false);
              })
            )
            .subscribe();
        })
        .on('mouseout', () => {
          d3.select('#tooltip').classed('hidden', true);
        });
    });

    const axisLeft = d3Axis.axisLeft(this.y).tickFormat(t => this.translateLeftAxisTick(t.toString()));
    this.g.append('g').call(axisLeft);

    const tickYear = this.masterdataService.getPhenoYear();
    const xTicks = d3Time
      .timeMonths(new Date(tickYear - 1, 11, 1), new Date(tickYear + 1, 0, 31))
      .map(d => this.toX(tickYear, d));

    const axisBottom = d3Axis.axisBottom(this.x);
    this.g
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + this.height + ')')
      .call(
        axisBottom.tickValues(xTicks).tickFormat(t =>
          moment()
            .dayOfYear(+t)
            .format('MMMM')
        )
      );
  }

  private drawVerticalLines(
    selection: string,
    analytics: Analytics,
    x1: (d: AnalyticsValue) => number,
    x2: (d: AnalyticsValue) => number,
    color: (d: AnalyticsValue) => string
  ) {
    this.g
      .selectAll(selection)
      .data(analytics.values)
      .enter()
      .append('line')
      .attr('y1', _ => this.y(this.toKey(analytics)))
      .attr('y2', _ => this.y(this.toKey(analytics)) + this.y.bandwidth())
      .attr('x1', d => x1(d))
      .attr('x2', d => x2(d))
      .attr('stroke', d => color(d))
      .style('stroke-width', 1)
      .style('opacity', 0.7);
  }

  private translateLeftAxisTick(input: string) {
    if (input.indexOf('-') > 0) {
      return this.translateService.instant(input.split('-')[1]);
    } else {
      return this.translateService.instant(input);
    }
  }

  private toX(year: number, value: Date) {
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
}
