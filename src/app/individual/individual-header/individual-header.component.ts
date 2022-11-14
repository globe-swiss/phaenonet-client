import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { filter, first, map, switchMap, mergeAll } from 'rxjs/operators';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';
import { GeoposService } from './geopos.service';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3 from 'd3';
import { Margin } from 'src/app/statistics/statistics-overview.component';
import { SensorsService } from 'src/app/sensors/sensors.service';
import { DailySensorData } from 'src/app/sensors/sensors';
import { Observation } from 'src/app/observation/observation';
import { ObservationService } from 'src/app/observation/observation.service';

const mapOrGraph = ['Map', 'Graph'] as const;
type MapOrGraph = typeof mapOrGraph[number];

@Component({
  selector: 'app-individual-header',
  templateUrl: './individual-header.component.html',
  styleUrls: ['./individual-header.component.scss']
})
export class IndividualHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;

  colors = {
    soil: { temperature: '#96A68B', humidity: '#405240' },
    air: { temperature: '#6B83BA', humidity: '#2C3A5C' }
  };

  geopos$: Observable<google.maps.LatLngLiteral>;

  @Input() mode: 'edit' | 'detail';
  edit: boolean;

  zoom: number;

  options: google.maps.MapOptions;
  markerOptions$: Observable<google.maps.MarkerOptions>;

  center$: Observable<google.maps.LatLngLiteral>;

  imageUrl$: Observable<string>;

  displayLocateMe: boolean;

  mapOrGraph: MapOrGraph = 'Map';

  sensorData: Observable<DailySensorData[]>;
  observations: Observable<Observation[]>;
  displayAirTemperature = true;
  displayAirHumidity = true;
  displaySoilTemperature = true;
  displaySoilHumidity = true;

  constructor(
    private geoposService: GeoposService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private analytics: AngularFireAnalytics,
    private sensorsService: SensorsService,
    private observationService: ObservationService
  ) {}

  ngOnInit(): void {
    this.edit = this.mode === 'edit';

    const config = {
      displayLocateMe: this.edit ? true : false,
      zoom: this.edit ? 9 : 13,
      mapTypeId: this.edit ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.TERRAIN,
      draggable: this.edit ? true : false,
      markerDraggable: this.edit ? true : false
    };

    const editIcon = { url: '/assets/img/map_pins/map_pin_generic.png', scaledSize: new google.maps.Size(55, 60) };

    this.displayLocateMe = config.displayLocateMe;
    this.zoom = config.zoom;
    this.options = {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      minZoom: 8,
      mapTypeId: config.mapTypeId,
      draggable: config.draggable
    };

    this.markerOptions$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(
        i =>
          ({
            draggable: config.markerDraggable,
            icon: this.edit ? editIcon : this.masterdataService.individualToIcon(i)
          } as google.maps.MarkerOptions)
      )
    );

    this.individual$
      .pipe(
        first(),
        filter(individual => individual !== undefined)
      )
      .subscribe(i => {
        if (i.geopos) {
          this.geoposService.update(new google.maps.LatLng(i.geopos));
        } else {
          this.geoposService.init();
        }
      });
    this.sensorData = this.individual$.pipe(
      switchMap(individual => this.sensorsService.getSensorData(this.individualService.composedId(individual)))
    );
    this.observations = this.individual$.pipe(
      switchMap(individual => this.observationService.listByIndividual(this.individualService.composedId(individual)))
    );

    this.center$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );

    const detailGeopos$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );
    this.geopos$ = this.edit ? this.geoposService.geopos$ : detailGeopos$;
    this.imageUrl$ = this.individual$.pipe(
      filter(individual => individual !== undefined),
      map(individual => this.individualService.getImageUrl(individual, true)),
      mergeAll()
    );
    this.scheduleDrawChart();
  }

  updateGeopos(event: google.maps.MapMouseEvent): void {
    if (this.edit) {
      this.geoposService.update(event.latLng);
    }
  }

  locateMe(): void {
    if (this.edit) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.geoposService.update(
            new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude })
          );
        });
      }
      void this.analytics.logEvent('individual.locate-me');
    }
  }

  onChange() {
    this.scheduleDrawChart();
  }

  scheduleDrawChart() {
    combineLatest([this.sensorData, this.observations, this.individual$])
      .pipe(first())
      .subscribe(([s, o, i]) => this.drawChart(s, o, i));
  }

  drawChart(sensorData: DailySensorData[], observations: Observation[], individual: Individual) {
    const svg = d3.select<SVGGraphicsElement, unknown>('#individual-header-graph');

    const boundingBox = svg.node()?.getBoundingClientRect();

    svg.selectAll('*').remove();

    const margin: Margin = { top: 30, right: 10, bottom: 20, left: 50 };

    const width = boundingBox.width - margin.left - margin.right;
    const height = boundingBox.height - (margin.top + margin.bottom);

    const xScale = d3Scale
      .scaleTime()
      .domain([new Date(individual.year, 0, 1), new Date(individual.year, 11, 31)])
      .range([0, width - (margin.left + margin.right)]);
    const xAxis = d3Axis.axisBottom(xScale).tickFormat(d3.timeFormat('%b'));
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
    const humidityAxis = d3Axis.axisRight(humidityScale);

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

    svg.append('g').attr('transform', `translate(${margin.left},${margin.bottom})`).call(tempAxis);
    svg
      .append('g')
      .attr('transform', `translate(${width - margin.right},${margin.bottom})`)
      .call(humidityAxis);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${height - margin.bottom + 10})`)
      .call(xAxis);

    if (this.displayAirTemperature)
      svg
        .append('path')
        .datum(sensorData)
        .attr('fill', 'none')
        .attr('stroke', this.colors.air.temperature)
        .attr('stroke-width', 1.5)
        .attr('d', airTemperatureLine);

    if (this.displaySoilTemperature)
      svg
        .append('path')
        .datum(sensorData)
        .attr('fill', 'none')
        .attr('stroke', this.colors.soil.temperature)
        .attr('stroke-width', 1.5)
        .attr('d', soilTemperatureLine)
        .enter();

    if (this.displayAirHumidity)
      svg
        .append('path')
        .datum(sensorData)
        .attr('fill', 'none')
        .attr('stroke', this.colors.air.humidity)
        .attr('stroke-width', 1.5)
        .attr('d', airHumidityLine);

    if (this.displaySoilHumidity)
      svg
        .append('path')
        .datum(sensorData)
        .attr('fill', 'none')
        .attr('stroke', this.colors.soil.humidity)
        .attr('stroke-width', 1.5)
        .attr('d', soilHumidityLine);

    observations.forEach(observation =>
      svg
        .append('line')
        .datum(observation)
        .attr('x1', xScale(observation.date))
        .attr('x2', xScale(observation.date))
        .attr('y1', height * 0.05)
        .attr('y2', height * 0.95)
        .attr('fill', 'none')
        .attr('stroke', this.masterdataService.getColor(observation.phenophase))
        .attr('stroke-width', 1.5)
    );

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 20)
      .attr('x', 0 - height / 2)
      .style('text-anchor', 'middle')
      .attr('font-size', 12)
      .text('°C');

    svg
      .append('text')
      .attr('transform', 'rotate(-270)')
      .attr('y', 0 - (width + 20))
      .attr('x', height / 2)
      .style('text-anchor', 'middle')
      .attr('font-size', 12)
      .text('%');

    svg
      .append('text')
      .attr('y', height + 20)
      .attr('x', width / 2)
      .style('text-anchor', 'middle')
      .attr('font-size', 12)
      .text(individual.year);
  }
}
