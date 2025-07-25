import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ObservationService } from '@app/domains/individual/shared/observation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { Observation } from '@shared/models/observation.model';
import { DailySensorData } from '@shared/models/sensors';
import { IndividualService } from '@shared/services/individual.service';
import { MasterdataService } from '@shared/services/masterdata.service';
import { SensorsService } from '@shared/services/sensors.service';
import { extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, combineLatest, zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-individual-header-graph',
  templateUrl: './individual-header-graph.widget.html',
  styleUrls: ['./individual-header-graph.widget.scss'],
  imports: [TranslateModule]
})
export class IndividualHeaderGraphComponent implements OnInit, OnChanges, OnDestroy {
  @Input() individual$: ReplaySubject<Individual>;
  @Input() displayTemperature: boolean;
  @Input() displayHumidity: boolean;

  subscriptions = new Subscription();

  // note: colors are also defined in _overwrite-mat.scss
  colors = {
    soil: '#736958',
    air: '#88c7ff'
  };

  initialized = false;
  sensorData$: Observable<DailySensorData[]>;
  observations$: Observable<Observation[]>;
  changeEvent$ = new BehaviorSubject(0);

  constructor(
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private sensorsService: SensorsService,
    private observationService: ObservationService,
    private translateService: TranslateService
  ) {}
  ngOnChanges(_changes: SimpleChanges): void {
    // re-render the svg on temperature/humidity selection
    this.changeEvent$.next(1);
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: UIEvent): void {
    // re-render the svg on window resize
    this.changeEvent$.next(1);
  }

  ngOnInit(): void {
    this.sensorData$ = this.individual$.pipe(
      mergeMap(individual => this.sensorsService.getSensorData(this.individualService.composedId(individual)))
    );
    this.observations$ = this.individual$.pipe(
      mergeMap(individual => this.observationService.listByIndividual(this.individualService.composedId(individual)))
    );

    /*
    To sync the graph we wait till both sensorData$ and observations$ are loaded to
    use the latest individual$ with this data.
    On change event the graph is updated instantly.
    */
    this.subscriptions.add(
      combineLatest([zip(this.sensorData$, this.observations$, this.individual$), this.changeEvent$]).subscribe(
        ([[s, o, i], _]) => this.drawChart(s, o, i)
      )
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  translate(key: string) {
    return String(this.translateService.instant(key));
  }

  isMobile(width: number) {
    return width <= 650;
  }

  drawChart(sensorData: DailySensorData[], observations: Observation[], individual: Individual) {
    const svg = select<SVGGraphicsElement, unknown>('#individual-header-graph');

    const boundingBox = svg.node()?.getBoundingClientRect();

    svg.selectAll('*').remove();

    const margin = { top: 40, right: 15, bottom: 70, left: 50 };

    const width = boundingBox.width - margin.left - margin.right;
    const height = boundingBox.height - (margin.top + margin.bottom);

    const legendX = this.isMobile(width) ? width - 25 : width / 2;
    const fontSize = this.isMobile(width) ? '12px' : '15px';
    const legendGapSize = this.isMobile(width) ? 20 : 30;

    const xScale = scaleTime()
      .domain([new Date(individual.year - 1, 11, 0), new Date(individual.year, 11, 31)])
      .range([0, width]);
    const xAxisTicks = axisBottom(xScale).ticks(4).tickFormat(timeFormat(''));
    const xAxisLabels = axisBottom(xScale)
      .tickValues([
        new Date(individual.year, 1, 15),
        new Date(individual.year, 4, 15),
        new Date(individual.year, 7, 15),
        new Date(individual.year, 10, 15)
      ])
      .tickSize(0)
      .tickFormat(timeFormat('Q%q'));
    const tempScale = scaleLinear()
      .domain(extent(sensorData.flatMap(d => [d.soilTemperature, d.airTemperature])))
      .range([height, 0])
      .nice();
    const tempAxis = axisLeft(tempScale);
    const humidityScale = scaleLinear()
      .domain(extent(sensorData.flatMap(d => [d.soilHumidity, d.airHumidity])))
      .range([height, 0])
      .nice();
    const humidityAxis = axisLeft(humidityScale);

    if (this.isMobile(width)) {
      tempAxis.ticks(5);
      humidityAxis.ticks(5);
    }

    const airTemperatureLine = line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => tempScale(d.airTemperature));

    const soilTemperatureLine = line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => tempScale(d.soilTemperature));

    const airHumidityLine = line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => humidityScale(d.airHumidity));

    const soilHumidityLine = line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => humidityScale(d.soilHumidity));

    if (this.displayTemperature) {
      svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).call(tempAxis);

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', 0 - margin.top - height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', fontSize)
        .text('°C');

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.air)
        .attr('stroke-width', 1.5)
        .attr('d', airTemperatureLine);

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.soil)
        .attr('stroke-width', 1.5)
        .attr('d', soilTemperatureLine)
        .enter();
    }

    if (this.displayHumidity) {
      svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).call(humidityAxis);
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', 0 - margin.top - height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', fontSize)
        .text('%');

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.air)
        .attr('stroke-width', 1.5)
        .attr('d', airHumidityLine);

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.soil)
        .attr('stroke-width', 1.5)
        .attr('d', soilHumidityLine);
    }

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top + height})`)
      .call(xAxisTicks);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top + height})`)
      .call(xAxisLabels);

    observations.forEach(observation => {
      const color = this.masterdataService.getColor(observation.phenophase);
      const axisHeight = margin.top + height;
      svg
        .append('line')
        .datum(observation)
        .attr('x1', xScale(observation.date) + margin.left)
        .attr('x2', xScale(observation.date) + margin.left)
        .attr('y1', margin.top)
        .attr('y2', axisHeight)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5);
      svg
        .append('circle')
        .attr('cx', xScale(observation.date) + margin.left)
        .attr('cy', axisHeight)
        .attr('r', '5px')
        .attr('fill', color)
        .attr('stroke', color)
        .attr('stroke-width', 1.5);
    });

    svg
      .append('text')
      .attr('y', margin.top + height + 10)
      .attr('x', margin.left + width / 2)
      .style('text-anchor', 'middle')
      .style('font-size', fontSize)
      .attr('alignment-baseline', 'hanging')
      .text(individual.year);

    svg
      .append('circle')
      .attr('cx', legendX - 15 - legendGapSize)
      .attr('cy', 15)
      .attr('r', 6)
      .style('fill', this.colors.air);
    svg
      .append('text')
      .attr('x', legendX - legendGapSize)
      .attr('y', 20)
      .text(this.translate('Luft'))
      .style('font-size', fontSize);
    svg
      .append('circle')
      .attr('cx', legendX + legendGapSize)
      .attr('cy', 15)
      .attr('r', 6)
      .style('fill', this.colors.soil);
    svg
      .append('text')
      .attr('x', legendX + 15 + legendGapSize)
      .attr('y', 20)
      .text(this.translate('Boden'))
      .style('font-size', fontSize);

    svg
      .append('text')
      .attr('x', margin.left / 2)
      .attr('y', 20)
      .text(
        this.translate(this.displayTemperature ? 'Temperatur (Tagesdurchschnitt)' : 'Feuchtigkeit (Tagesdurchschnitt)')
      )
      .style('font-size', fontSize);

    // correct axis ticks font
    svg.selectAll('.tick text').style('font-family', "'Open Sans', sans-serif");
  }
}
