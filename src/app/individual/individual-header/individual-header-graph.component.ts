import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
export class IndividualHeaderGraphComponent implements OnInit, OnChanges {
  @Input() individual$: ReplaySubject<Individual>;
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;

  // note: colors are also defined in _overwrite-mat.scss
  colors = {
    soil: '#736958',
    air: '#88c7ff'
  };

  initialized = false;
  sensorData$: Observable<DailySensorData[]>;
  observations$: Observable<Observation[]>;
  resizeEvent$ = new BehaviorSubject(0);
  @Input() displayTemperature: boolean;
  @Input() displayHumidity: boolean;

  constructor(
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private sensorsService: SensorsService,
    private observationService: ObservationService
  ) {}
  ngOnChanges(_changes: SimpleChanges): void {
    // avoid being executed before nginit()
    if (this.initialized) {
      this.scheduleDrawChart();
    }
  }

  @HostListener('window:resize', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onResize(_: UIEvent): void {
    // re-render the svg on window resize
    this.resizeEvent$.next(1);
  }

  ngOnInit(): void {
    this.sensorData$ = this.individual$.pipe(
      switchMap(individual => this.sensorsService.getSensorData(this.individualService.composedId(individual)))
    );
    this.observations$ = this.individual$.pipe(
      switchMap(individual => this.observationService.listByIndividual(this.individualService.composedId(individual)))
    );

    this.scheduleDrawChart();
    this.initialized = true;
  }

  scheduleDrawChart() {
    combineLatest([this.sensorData$, this.observations$, this.individual$, this.resizeEvent$]).subscribe(([s, o, i]) =>
      this.drawChart(s, o, i)
    );
  }

  drawChart(sensorData: DailySensorData[], observations: Observation[], individual: Individual) {
    const svg = d3.select<SVGGraphicsElement, unknown>('#individual-header-graph');

    const boundingBox = svg.node()?.getBoundingClientRect();

    svg.selectAll('*').remove();

    const margin: Margin = { top: 40, right: 10, bottom: 40, left: 50 };

    const width = boundingBox.width - margin.left - margin.right;
    const height = boundingBox.height - (margin.top + margin.bottom);

    const xScale = d3Scale
      .scaleTime()
      .domain([new Date(individual.year - 1, 11, 0), new Date(individual.year, 11, 31)])
      .range([0, width - (margin.left + margin.right)]);
    const xAxis = d3Axis.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('Q%q'));
    const tempScale = d3Scale
      .scaleLinear()
      .domain(d3.extent(sensorData.flatMap(d => [d.soilTemperature, d.airTemperature])))
      .range([height - 30, 0])
      .nice();
    const tempAxis = d3Axis.axisLeft(tempScale);
    const humidityScale = d3Scale
      .scaleLinear()
      .domain(d3.extent(sensorData.flatMap(d => [d.soilHumidity, d.airHumidity])))
      .range([height - 30, 0])
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
      svg.append('g').attr('transform', `translate(${margin.left},${margin.bottom})`).call(tempAxis);

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', 0 - height / 2)
        .style('text-anchor', 'middle')
        .attr('font-size', 12)
        .text('°C');

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.bottom})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.air)
        .attr('stroke-width', 1.5)
        .attr('d', airTemperatureLine);

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.bottom})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.soil)
        .attr('stroke-width', 1.5)
        .attr('d', soilTemperatureLine)
        .enter();
    }

    if (this.displayHumidity) {
      svg.append('g').attr('transform', `translate(${margin.left},${margin.bottom})`).call(humidityAxis);
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', 0 - height / 2)
        .style('text-anchor', 'middle')
        .attr('font-size', 12)
        .text('%');

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.bottom})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.air)
        .attr('stroke-width', 1.5)
        .attr('d', airHumidityLine);

      svg
        .append('path')
        .datum(sensorData)
        .attr('transform', `translate(${margin.left},${margin.bottom})`)
        .attr('fill', 'none')
        .attr('stroke', this.colors.soil)
        .attr('stroke-width', 1.5)
        .attr('d', soilHumidityLine);
    }

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${height - margin.bottom + 50})`)
      .call(xAxis);

    observations.forEach(observation => {
      const color = this.masterdataService.getColor(observation.phenophase);
      const axisHeight = height - margin.bottom + 10;
      svg
        .append('line')
        .datum(observation)
        .attr('x1', xScale(observation.date))
        .attr('x2', xScale(observation.date))
        .attr('y1', margin.bottom)
        .attr('y2', margin.bottom + axisHeight)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5);
      svg
        .append('circle')
        .attr('cx', xScale(observation.date))
        .attr('cy', margin.bottom + axisHeight)
        .attr('r', '5px')
        .attr('fill', color)
        .attr('stroke', color)
        .attr('stroke-width', 1.5);
    });

    svg
      .append('text')
      .attr('y', height + 20)
      .attr('x', width / 2)
      .style('text-anchor', 'middle')
      .attr('font-size', 12)
      .text(individual.year);

    svg
      .append('circle')
      .attr('cx', width / 2 - 45)
      .attr('cy', 15)
      .attr('r', 6)
      .style('fill', this.colors.air);
    svg
      .append('text')
      .attr('x', width / 2 - 30)
      .attr('y', 20)
      .text('Luft')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    svg
      .append('circle')
      .attr('cx', width / 2 + 30)
      .attr('cy', 15)
      .attr('r', 6)
      .style('fill', this.colors.soil);
    svg
      .append('text')
      .attr('x', width / 2 + 45)
      .attr('y', 20)
      .text('Boden')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');

    if (width > 650) {
      svg
        .append('text')
        .attr('x', margin.left)
        .attr('y', 20)
        .text(this.displayTemperature ? 'Temperatur (in Grad Celsius)' : 'Feuchtigkeit (in Prozent)')
        .style('font-size', '15px')
        .attr('alignment-baseline', 'middle');
    }
  }
}
