import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, combineLatest, zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Observation } from 'src/app/observation/observation';
import { ObservationService } from 'src/app/observation/observation.service';
import { DailySensorData } from 'src/app/sensors/sensors';
import { SensorsService } from 'src/app/sensors/sensors.service';
import { Margin } from 'src/app/statistics/statistics-overview.component';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';

@Component({
  selector: 'app-individual-header-graph',
  templateUrl: './individual-header-graph.component.html',
  styleUrls: ['./individual-header-graph.component.scss']
})
export class IndividualHeaderGraphComponent implements OnInit, OnChanges, OnDestroy {
  @Input() individual$: ReplaySubject<Individual>;
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
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
  @Input() displayTemperature: boolean;
  @Input() displayHumidity: boolean;

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  drawChart(sensorData: DailySensorData[], observations: Observation[], individual: Individual) {
    const svg = d3.select<SVGGraphicsElement, unknown>('#individual-header-graph');

    const boundingBox = svg.node()?.getBoundingClientRect();

    svg.selectAll('*').remove();

    const margin: Margin = { top: 40, right: 15, bottom: 70, left: 50 };

    const width = boundingBox.width - margin.left - margin.right;
    const height = boundingBox.height - (margin.top + margin.bottom);

    const legendX = width > 650 ? width / 2 : width - 25;
    const fontSize = width > 650 ? '15px' : '12px';
    const legendGapSize = width > 650 ? 30 : 20;

    const xScale = d3Scale
      .scaleTime()
      .domain([new Date(individual.year - 1, 11, 0), new Date(individual.year, 11, 31)])
      .range([0, width]);
    const xAxis_ticks = d3Axis.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat(''));
    const xAxis_lables = d3Axis
      .axisBottom(xScale)
      .tickValues([
        new Date(individual.year, 1, 15),
        new Date(individual.year, 4, 15),
        new Date(individual.year, 7, 15),
        new Date(individual.year, 10, 15)
      ])
      .tickSize(0)
      .tickFormat(d3.timeFormat('Q%q'));
    const tempScale = d3Scale
      .scaleLinear()
      .domain(d3.extent(sensorData.flatMap(d => [d.soilTemperature, d.airTemperature])))
      .range([height, 0])
      .nice();
    const tempAxis = d3Axis.axisLeft(tempScale);
    const humidityScale = d3Scale
      .scaleLinear()
      .domain(d3.extent(sensorData.flatMap(d => [d.soilHumidity, d.airHumidity])))
      .range([height, 0])
      .nice();
    const humidityAxis = d3Axis.axisLeft(humidityScale);

    const airTemperatureLine = d3
      .line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => tempScale(d.airTemperature));

    const soilTemperatureLine = d3
      .line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => tempScale(d.soilTemperature));

    const airHumidityLine = d3
      .line<DailySensorData>()
      .x(d => xScale(d.day))
      .y(d => humidityScale(d.airHumidity));

    const soilHumidityLine = d3
      .line<DailySensorData>()
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
      .call(xAxis_ticks);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top + height})`)
      .call(xAxis_lables);

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
  }
}
