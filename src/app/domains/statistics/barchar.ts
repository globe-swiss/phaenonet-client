import { ElementRef } from '@angular/core';
import { ObsWoy, Statistics } from '@shared/models/statistics';
import { max } from 'd3-array';
import { axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { area, curveMonotoneX } from 'd3-shape';
import { drawXAxis } from './draw';

let obsWoyCurrentYear: ObsWoy[] = [];
let obsWoy5Years: ObsWoy[] = [];
let obsWoy30Years: ObsWoy[] = [];

const legendFontSize = getComputedStyle(document.documentElement).getPropertyValue('--legend-font-size');

export function getObsWoyCurrentYear(): ObsWoy[] {
  return [...obsWoyCurrentYear];
}

export function setObsWoyCurrentYear(data: ObsWoy[]): void {
  obsWoyCurrentYear = [...data];
}

export function getObsWoy5Years(): ObsWoy[] {
  return obsWoy5Years;
}

export function setObsWoy5Years(data: ObsWoy[]): void {
  obsWoy5Years = [...data];
}

export function getObsWoy30Years(): ObsWoy[] {
  return obsWoy30Years;
}

export function setObsWoy30Years(data: ObsWoy[]): void {
  obsWoy30Years = [...data];
}

export function aggregateObsWoy(results: Statistics[], period: number) {
  const aggregationObservations = results
    .filter(r => r.agg_range == period && r.years == period)
    .flatMap(r => r.obs_woy);
  const aggregated: Record<number, number> = {};

  for (const record of aggregationObservations) {
    for (const weekStr in record) {
      const week = Number(weekStr);
      const count = record[week];

      if (!aggregated[week]) {
        aggregated[week] = 0;
      }

      aggregated[week] += count;
    }
  }
  const ret = Object.entries(aggregated).map(([week, count]) => ({
    week: Number(week),
    count: count / period // tocheck: round results? -> Math.round(count / period)
  }));
  return ensureAllWeeks(ret);
}

export function ensureAllWeeks(array: ObsWoy[]): ObsWoy[] {
  const allWeeks: ObsWoy[] = [];

  for (let week = -3; week <= 53; week++) {
    const existing = array.find(item => item.week === week);
    if (existing) {
      allWeeks.push(existing);
    } else {
      allWeeks.push({ week, count: 0 });
    }
  }
  return allWeeks;
}

export function initializeArray(start: number, end: number, step: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

export function createBarChart(statisticsContainer: ElementRef<HTMLDivElement>): number {
  const svg = select<SVGGraphicsElement, unknown>('#app-bar-chart');

  svg.selectAll('*').remove();

  const boundingBox = svg.node()?.getBoundingClientRect();
  // Set dimensions and margins for the chart

  const legendSize = 100;

  const margin = { top: legendSize, right: 20, bottom: 30 };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const offsetLeft = statisticsContainer.nativeElement.offsetLeft; // aligned with year chart
  const offsetTop = statisticsContainer.nativeElement.offsetTop;
  const width = boundingBox.width - margin.right;
  const height = Math.max(window.innerHeight - offsetTop - 5, legendSize + 100);

  // Set up the scales
  const xScale = scaleLinear().domain([-30, 365]).range([30, width]);

  const yScale = scaleLinear().range([height - margin.bottom, 0 + margin.top]);
  const dom = max([...obsWoy5Years, ...obsWoy30Years, ...obsWoyCurrentYear], d => d.count);
  if (dom === 0) {
    yScale.domain([0, 5]);
  } else {
    yScale.domain([0, dom]);
  }

  // const xBar = d3.scaleBand().range([0, width]).padding(0.4);
  // xBar.domain(
  //   datasetCurrentYear.map(function (d) {
  //     return d.week.toString();
  //   })
  // );

  const weekWidth = width / obsWoyCurrentYear.length;
  const barWidth = weekWidth - weekWidth / 3;

  drawXAxis(svg, xScale, width, margin.top, height - margin.bottom);

  // Add the y-axis
  svg.append('g').attr('transform', `translate(30)`).call(axisLeft(yScale));

  // create a legend
  svg
    .append('text')
    .attr('x', 36)
    .attr('y', 10)
    .text('Summe der Beobachtungen pro Woche')
    .style('font-size', legendFontSize)
    .style('font-weight', '500')
    .attr('alignment-baseline', 'middle');
  svg.append('circle').attr('cx', 40).attr('cy', 35).attr('r', 6).style('fill', 'steelblue');
  svg.append('circle').attr('cx', 40).attr('cy', 55).attr('r', 6).style('fill', 'pink');
  svg.append('circle').attr('cx', 40).attr('cy', 75).attr('r', 6).style('fill', 'red');
  svg
    .append('text')
    .attr('x', 50)
    .attr('y', 35)
    .text('Ø der 5 Jahre vor dem ausgewählten Jahr')
    .style('font-size', legendFontSize)
    .attr('alignment-baseline', 'middle');
  svg
    .append('text')
    .attr('x', 50)
    .attr('y', 55)
    .text('Ø der 30 Jahre vor dem ausgewählten Jahr')
    .style('font-size', legendFontSize)
    .attr('alignment-baseline', 'middle');
  svg
    .append('text')
    .attr('x', 50)
    .attr('y', 75)
    .text('Ausgewähltes Jahr')
    .style('font-size', legendFontSize)
    .attr('alignment-baseline', 'middle');

  // Create the area generator
  const chartArea = area<ObsWoy>()
    .curve(curveMonotoneX)
    .x(d => xScale(woy2doy(d.week)))
    .y0(height - margin.bottom)
    .y1(d => yScale(d.count));

  // Add the line path to the SVG element

  svg
    .append('path')
    .datum(getObsWoy5Years())
    .attr('class', 'area')
    .attr('fill', 'steelblue')
    .attr('opacity', '0.5')
    .attr('d', chartArea);

  svg
    .append('path')
    .datum(getObsWoy30Years())
    .attr('class', 'area')
    .attr('fill', 'pink')
    .attr('opacity', '0.5')
    .attr('d', chartArea);

  svg
    .selectAll('.bar')
    .data(getObsWoyCurrentYear())
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function (d) {
      return xScale(woy2doy(d.week));
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

  return height;
}

function woy2doy(woy: number): number {
  return woy * 7;
}
