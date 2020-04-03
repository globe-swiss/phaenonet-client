import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3 from 'd3-selection';
import * as d3Time from 'd3-time';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { first, map, startWith, switchMap } from 'rxjs/operators';
import { formatShortDate } from '../core/formatDate';
import { NavService } from '../core/nav/nav.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { PhenophaseGroup } from '../masterdata/phaenophase-group';
import { SourceType } from '../masterdata/source-type';
import { Species } from '../masterdata/species';
import { Observation } from '../observation/observation';
import { Analytics } from './analytics';
import { AnalyticsType } from './analytics-type';
import { AnalyticsValue } from './analytics-value';
import { StatisticsService } from './statistics.service';
import * as moment from 'moment';

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

export interface YearValue {
  id: string;
  value: number;
}

const allSpecies = { id: 'all', de: 'Alle' } as Species;

const allYear = { id: 'all', value: null } as YearValue;

@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './statistics-overview.component.html',
  styleUrls: ['./statistics-overview.component.scss']
})
export class StatisticsOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('statisticsContainer', { static: true }) statisticsContainer: ElementRef;

  years = [allYear, ...this.masterdataService.availableYears.map(y => ({ id: '' + y, value: y } as YearValue))];
  datasources: SourceType[] = ['all', 'globe', 'meteoswiss'];
  analyticsTypes: AnalyticsType[] = ['species', 'altitude'];
  species: Subject<Species[]> = new ReplaySubject(1);

  filterForm = new FormGroup({
    year: new FormControl(this.years[1]),
    datasource: new FormControl(this.datasources[0]),
    analyticsType: new FormControl(this.analyticsTypes[0]),
    species: new FormControl(allSpecies.id)
  });

  private margin: Margin = { top: 20, right: 20, bottom: 30, left: 160 };

  private width: number;
  private height: number;

  private offsetLeft: number;
  private offsetTop: number;

  private svg: any;

  private x: any;
  private y: any;
  private g: any;

  private year: number;
  private data: Analytics[];

  private colorMap = {};

  constructor(
    private navService: NavService,
    private statisticsService: StatisticsService,
    private masterdataService: MasterdataService,
    private translateService: TranslateService
  ) {}

  availablePhenophases: Observable<Phenophase[]>;
  availablePhenophaseGroups: Observable<PhenophaseGroup[]>;
  observations: Observable<Observation[]>;
  phenophaseObservationsGroups: Observable<ObservationData[]>;

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    // re-render the svg on window resize
    this.drawChart();
  }

  ngOnInit() {
    this.navService.setLocation('Auswertungen');
    this.masterdataService
      .getSpecies()
      .pipe(map(species => [allSpecies].concat(species)))
      .subscribe(this.species);
  }

  ngAfterViewInit(): void {
    this.colorMap = this.masterdataService.colorMap;

    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.getRawValue()),
        switchMap(form => {
          const year: YearValue = form.year;
          const datasource: SourceType = form.datasource;
          let analyticsType: AnalyticsType = form.analyticsType;
          let species: string = form.species;

          this.year = year.value;

          // set to single species if altitude and all species
          if (
            (analyticsType === 'altitude' && form.species === allSpecies.id) ||
            (year === allYear && form.species === allSpecies.id)
          ) {
            species = 'BA';
            this.filterForm.controls.species.setValue('BA', { emitEvent: false });
          }

          if (year === allYear) {
            analyticsType = 'species';
            this.filterForm.controls.analyticsType.setValue(this.analyticsTypes[0], { emitEvent: false });
          }

          return this.statisticsService.listByYear(year, analyticsType, datasource, species);
        }),
        map(results => {
          this.data = results;
          this.drawChart();
        })
      )
      .subscribe();
  }

  private toKey(analytics: Analytics) {
    if (analytics.altitude_grp) {
      return analytics.species + '-' + analytics.altitude_grp;
    } else if (this.year === allYear.value) {
      return analytics.species + '-' + analytics.year;
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

    this.x = d3Scale
      .scaleLinear()
      .domain([-30, 395])
      .range([0, this.width])
      .nice();

    const domain = this.data.map(analytics => analytics.species);
    const subdomain =
      this.year === allYear.value
        ? this.masterdataService.availableYears
        : [...new Set(this.data.map(analytics => analytics.altitude_grp))].sort().reverse();

    const resultingDomain = [];
    domain.forEach(species => {
      subdomain.forEach(subdomainKey => {
        if (subdomainKey) {
          resultingDomain.push(species + '-' + subdomainKey);
        } else {
          resultingDomain.push(species);
        }
      });
    });

    this.y = d3Scale
      .scaleBand()
      .domain(resultingDomain)
      .rangeRound([0, this.height])
      .padding(0.4);

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
        .attr('stroke', d => this.colorMap[d.phenophase])
        .attr('stroke-width', 1)
        .style('opacity', 0.7)
        .attr('fill', 'none');

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
        .attr('fill', d => this.colorMap[d.phenophase])
        .style('opacity', 0.7)
        .attr('stroke', '#262626')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(d) {
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

          self.masterdataService
            .getPhenophaseValue(analytics.species, d.phenophase)
            .pipe(
              first(),
              map(phenophase => {
                d3.select('#tooltip')
                  .select('#title')
                  .text(self.translateService.instant(phenophase.name_de));

                d3.select('#tooltip').classed('hidden', false);
              })
            )
            .subscribe();
        })
        .on('mouseout', _ => {
          d3.select('#tooltip').classed('hidden', true);
        });

      this.drawVerticalLines(
        '.median',
        analytics,
        d => this.x(this.toX(analytics.year, d.median)),
        d => this.x(this.toX(analytics.year, d.median)),
        d => this.colorMap[d.phenophase]
      );

      this.drawVerticalLines(
        '.whiskersMin',
        analytics,
        d => this.x(this.toX(analytics.year, d.min)),
        d => this.x(this.toX(analytics.year, d.min)),
        d => this.colorMap[d.phenophase]
      );

      this.drawVerticalLines(
        '.whiskersMax',
        analytics,
        d => this.x(this.toX(analytics.year, d.max)),
        d => this.x(this.toX(analytics.year, d.max)),
        d => this.colorMap[d.phenophase]
      );
    });

    const axisLeft = d3Axis.axisLeft(this.y).tickFormat(t => this.translateLeftAxisTick(t.toString()));
    this.g.append('g').call(axisLeft);

    const tickYear = new Date().getFullYear();
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
