import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';
import { Species } from '@shared/models/masterdata.model';
import { MasterdataService } from '@shared/models/masterdata.service';
import { Observation } from '@shared/models/observation.model';
import { SourceFilterType } from '@shared/models/source-type.model';
import { FormPersistenceService } from '@shared/services/form-persistence.service';
import { formatShortDate } from '@shared/utils/formatDate';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3 from 'd3-selection';
import * as d3Time from 'd3-time';
import moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { AltitudeGroup, Analytics, AnalyticsType, AnalyticsValue } from './statistics.model';
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
  selectableYears$: Observable<string[]>;
  selectableDatasources: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger', 'wld'];
  selectableAnalyticsTypes: AnalyticsType[] = ['species', 'altitude'];
  selectableSpecies$: Observable<Species[]>;

  filter: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<SourceFilterType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
  }>;
  private redraw$ = new Subject();
  private subscriptions = new Subscription();

  private year: number | null; // null if all year
  private data: Analytics[];
  translationsLoaded = false;

  svgComponentHeight = 0;

  constructor(
    private navService: NavService,
    private statisticsService: StatisticsService,
    private masterdataService: MasterdataService,
    private formPersistanceService: FormPersistenceService,
    private translateService: TranslateService
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

    // workaround hitting issue with standalone components: https://github.com/angular/components/issues/17839
    this.subscriptions.add(
      this.translateService.get(this.selectableDatasources[0]).subscribe(() => {
        this.translationsLoaded = true;
      })
    );

    if (!this.formPersistanceService.statisticFilter) {
      this.filter = new FormGroup({
        year: new FormControl(''),
        datasource: new FormControl(this.selectableDatasources[0]),
        analyticsType: new FormControl(this.selectableAnalyticsTypes[0]),
        species: new FormControl(allSpecies.id)
      });
      this.masterdataService.phenoYear$
        .pipe(first())
        .subscribe(year => this.filter.controls.year.patchValue(String(year)));
      this.formPersistanceService.statisticFilter = this.filter;
    } else {
      this.filter = this.formPersistanceService.statisticFilter;
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

    this.selectableYears$ = this.masterdataService.availableYears$.pipe(
      tap(years => (this.availableYears = years)),
      map(years => [allYear, ...years.map(year => String(year))])
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

    const margin: Margin = { top: 0, right: 20, bottom: 30, left: 130 };
    const offsetLeft = this.statisticsContainer.nativeElement.offsetLeft;
    const offsetTop = this.statisticsContainer.nativeElement.offsetTop;
    const width = boundingBox.width - margin.left - margin.right;
    const xScale = d3Scale.scaleLinear().domain([-30, 365]).range([0, width]);
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const domain = Array.from(new Set(this.data.map(analytics => analytics.species)));
    const subdomain = !this.year
      ? this.availableYears
      : [...new Set(this.data.map(analytics => analytics.altitude_grp))].sort().reverse();

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

    // required height for the y-axis based on the abount of domains to display
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
    this.data.forEach(analytics => {
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
}
