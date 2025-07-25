import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { allValue } from '@shared/models/source-type.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDate } from '@shared/utils/formatDate';
import { axisLeft } from 'd3-axis';
import { ScaleBand, scaleBand, scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { iif, Subject, Subscription } from 'rxjs';
import { debounceTime, first, map, switchMap } from 'rxjs/operators';
import { dateToDOY, drawXAxis } from '../shared/graph-helper';
import { AltitudeGroup } from '../shared/statistics-common.model';
import { StatisticsFilterService } from '../shared/statistics-filter.service';
import { StatisticsAltitudeService } from './statistics-altitude.service';
import { StatisticsSpeciesService } from './statistics-species.service';
import { Analytics, AnalyticsValue } from './statistics-yearly.model';

@Component({
  selector: 'app-yearly-graph',
  templateUrl: './yearly-graph.widget.html',
  styleUrls: ['./yearly-graph.widget.scss'],
  standalone: true
})
export class YearlyGraphComponent implements OnInit, OnDestroy {
  @ViewChild('statisticsContainer', { static: true }) statisticsContainer: ElementRef<HTMLDivElement>;

  private _redraw$ = new Subject<void>();
  @Input()
  set triggerRedraw(value: unknown) {
    this._redraw$.next();
  }

  private subscriptions = new Subscription();
  svgComponentHeight = 0; // height used to scale the svg component

  private data: Analytics[];
  private year: null | number; // null if all year
  private availableYears: number[] = [];

  constructor(
    private statisticsSpeciesService: StatisticsSpeciesService,
    private statisticsAltitudeService: StatisticsAltitudeService,
    private masterdataService: MasterdataService,
    private translateService: TranslateService,
    private statisticsFilterService: StatisticsFilterService
  ) {}

  ngOnInit() {
    // set avaialble years once
    this.masterdataService.availableYears$.pipe(first()).subscribe(years => (this.availableYears = years));

    // fetch data on filter change and redraw chart
    const filterSubscription = this.statisticsFilterService.currentFilters$
      .pipe(
        switchMap(({ year, datasource, analyticsType, species }) =>
          iif(
            () => analyticsType === 'altitude',
            this.statisticsAltitudeService.listByYear(year, datasource, species),
            this.statisticsSpeciesService.listByYear(year, datasource, species)
          ).pipe(map(data => ({ year, data })))
        )
      )
      .subscribe(({ year, data }) => {
        this.year = year === allValue ? null : +year;
        this.data = data;
        this._redraw$.next();
      });

    //redraw chart when triggered
    const redrawSubscription = this._redraw$.pipe(debounceTime(10)).subscribe(() => this.drawChart());

    this.subscriptions.add(filterSubscription);
    this.subscriptions.add(redrawSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

    const domain = Array.from(new Set(this.data.map(analytics => analytics.species)));
    const subdomain = !this.year
      ? this.getFilteredYearRange()
      : [...new Set(this.data.map(analytics => analytics.altitude_grp))].sort().reverse();

    const resultingDomain = [];
    domain.forEach(species => {
      subdomain.forEach((subdomainKey: number | AltitudeGroup) => {
        if (subdomainKey) {
          // a all year is set or analytics type is altitude
          resultingDomain.push(`${species}-${subdomainKey}`);
        } else {
          // a specific year is set and analytics type is species
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
    this.data.forEach(analytics => {
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

  private toKey(analytics: Analytics) {
    if (analytics.altitude_grp) {
      return `${analytics.species}-${analytics.altitude_grp}`;
    } else if (!this.year) {
      return `${analytics.species}-${analytics.year}`;
    } else {
      return analytics.species;
    }
  }

  getColor(phenophase: string): string {
    return this.masterdataService.getColor(phenophase);
  }

  private drawVerticalLines(
    g: Selection<SVGGElement, unknown, HTMLElement, unknown>,
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

  private getFilteredYearRange(): number[] {
    const yearsWithData = [...new Set(this.data.map(analytics => analytics.year))].sort((a, b) => a - b);
    if (yearsWithData.length === 0) {
      return [];
    }

    const firstYearWithData = yearsWithData[0];
    const currentYear = this.availableYears[0];
    return this.availableYears.filter(year => year >= firstYearWithData && year <= currentYear);
  }
}
