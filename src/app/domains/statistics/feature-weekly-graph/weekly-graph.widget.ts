import { Component, ElementRef, Input, OnDestroy, OnInit, viewChild } from '@angular/core';
import { ObsDoy, ObsWoy, Statistics } from '@app/domains/statistics/feature-weekly-graph/statistics-weekly.model';
import { TranslateService } from '@ngx-translate/core';
import { max } from 'd3-array';
import { axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { area, curveMonotoneX } from 'd3-shape';
import { debounceTime, Subject, Subscription, switchMap } from 'rxjs';
import { drawXAxis } from '../shared/graph-helper';
import { StatisticsFilterService } from '../shared/statistics-filter.service';
import { StatisticsService } from './statistics.service';

@Component({
  selector: 'app-weekly-graph',
  templateUrl: './weekly-graph.widget.html',
  standalone: true
})
export class WeeklyGraphComponent implements OnInit, OnDestroy {
  readonly statisticsContainer = viewChild.required<ElementRef<HTMLDivElement>>('statisticsContainer');
  private readonly legendFontSize = getComputedStyle(document.documentElement).getPropertyValue('--legend-font-size');

  private _redraw$ = new Subject<void>();
  @Input()
  set triggerRedraw(value: unknown) {
    this._redraw$.next();
  }

  private subscriptions = new Subscription();
  svgComponentHeight = 0; // height used to scale the svg component

  private obsWoyCurrentYear: ObsDoy[] = [];
  private obsWoy5Years: ObsDoy[] = [];
  private obsWoy30Years: ObsDoy[] = [];

  constructor(
    private statisticsService: StatisticsService,
    private statisticsFilterService: StatisticsFilterService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    const filterSubscription = this.statisticsFilterService.currentFilters$
      .pipe(
        switchMap(({ year, phenophase, altitude, species }) =>
          this.statisticsService.getStatistics(year, phenophase, altitude, species)
        )
      )
      .subscribe(data => {
        this.obsWoyCurrentYear = this.aggregateObsWoy(data, 1);
        this.obsWoy5Years = this.aggregateObsWoy(data, 5);
        this.obsWoy30Years = this.aggregateObsWoy(data, 30);
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

    svg.selectAll('*').remove();

    const boundingBox = svg.node()?.getBoundingClientRect();
    // Set dimensions and margins for the chart

    const legendSize = 100;

    const margin = { top: legendSize, right: 20, bottom: 30 };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offsetLeft = this.statisticsContainer().nativeElement.offsetLeft; // aligned with year chart
    const offsetTop = this.statisticsContainer().nativeElement.offsetTop;
    const width = boundingBox.width - margin.right;
    const height = Math.max(window.innerHeight - offsetTop - 5, legendSize + 100);
    this.svgComponentHeight = height;

    // Set up the scales
    const xScale = scaleLinear().domain([-30, 365]).range([30, width]);

    const yScale = scaleLinear().range([height - margin.bottom, 0 + margin.top]);

    // set y-axis domain dynamically or to 5 if no data is available
    const dom = max([...this.obsWoy5Years, ...this.obsWoy30Years, ...this.obsWoyCurrentYear], d => d.count);
    if (dom === 0) {
      yScale.domain([0, 5]);
    } else {
      yScale.domain([0, dom]);
    }

    const weekWidth = width / this.obsWoyCurrentYear.length;
    const barWidth = weekWidth - weekWidth / 3;

    drawXAxis(svg, xScale, width, margin.top, height - margin.bottom);

    // Add the y-axis
    svg.append('g').attr('transform', `translate(30)`).call(axisLeft(yScale));

    // create a legend
    svg
      .append('text')
      .attr('x', 36)
      .attr('y', 10)
      .text(`${this.translateService.instant('Summe der Beobachtungen pro Woche')}`)
      .style('font-size', this.legendFontSize)
      .style('font-weight', '500')
      .attr('alignment-baseline', 'middle');
    svg.append('circle').attr('cx', 40).attr('cy', 35).attr('r', 6).style('fill', 'steelblue');
    svg.append('circle').attr('cx', 40).attr('cy', 55).attr('r', 6).style('fill', 'pink');
    svg.append('circle').attr('cx', 40).attr('cy', 75).attr('r', 6).style('fill', 'red');
    svg
      .append('text')
      .attr('x', 50)
      .attr('y', 35)
      .text(`${this.translateService.instant('Ø der 5 Jahre vor dem ausgewählten Jahr')}`)
      .style('font-size', this.legendFontSize)
      .attr('alignment-baseline', 'middle');
    svg
      .append('text')
      .attr('x', 50)
      .attr('y', 55)
      .text(`${this.translateService.instant('Ø der 30 Jahre vor dem ausgewählten Jahr')}`)
      .style('font-size', this.legendFontSize)
      .attr('alignment-baseline', 'middle');
    svg
      .append('text')
      .attr('x', 50)
      .attr('y', 75)
      .text(`${this.translateService.instant('Ausgewähltes Jahr')}`)
      .style('font-size', this.legendFontSize)
      .attr('alignment-baseline', 'middle');

    // Create the area generator
    const chartArea = area<ObsDoy>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.doy))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.count));

    // Add the line path to the SVG element

    svg
      .append('path')
      .datum(this.obsWoy5Years)
      .attr('class', 'area')
      .attr('fill', 'steelblue')
      .attr('opacity', '0.5')
      .attr('d', chartArea);

    svg
      .append('path')
      .datum(this.obsWoy30Years)
      .attr('class', 'area')
      .attr('fill', 'pink')
      .attr('opacity', '0.5')
      .attr('d', chartArea);

    svg
      .selectAll('.bar')
      .data(this.obsWoyCurrentYear)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return xScale(d.doy);
      })
      .attr('y', function (d) {
        return yScale(d.count);
      })
      .attr('width', barWidth)
      .attr('height', function (d) {
        return height - margin.bottom - yScale(d.count);
      })
      .attr('fill', 'red')
      .attr('opacity', '0.6');

    // adjust fonts
    svg.selectAll('.tick text').style('font-family', "'Open Sans', sans-serif");
  }

  private aggregateObsWoy(results: Statistics[], period: number) {
    const aggregationObservations = results
      .filter(r => r.agg_range == period && r.years == period)
      .flatMap(r => r.obs_woy);
    const aggregated: Record<number, number> = {};

    aggregationObservations.forEach(record => {
      Object.entries(record).forEach(([weekStr, count]: [string, number]) => {
        const week = Number(weekStr);
        aggregated[week] = (aggregated[week] || 0) + count;
      });
    });

    const ret = Object.entries(aggregated).map(([week, count]) => ({
      week: Number(week),
      count: count / period
    }));
    return this.ensureAllWeeks(ret); // todo: not needed as time chart
  }

  private ensureAllWeeks(array: ObsWoy[]): ObsDoy[] {
    const allDoys: ObsDoy[] = [];

    for (let week = -3; week <= 53; week++) {
      const existing = array.find(item => item.week === week);
      if (existing) {
        allDoys.push({ doy: this.woy2doy(week), count: existing.count });
      } else {
        allDoys.push({ doy: this.woy2doy(week), count: 0 });
      }
    }
    return allDoys;
  }

  private woy2doy(woy: number): number {
    return woy * 7;
  }
}
