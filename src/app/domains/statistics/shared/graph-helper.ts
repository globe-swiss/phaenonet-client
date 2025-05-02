import { axisBottom } from 'd3-axis';
import { timeMonths } from 'd3-time';
import moment from 'moment';

export function drawXAxis(
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  xScale: d3.ScaleLinear<number, number>,
  width: number,
  yAxisStart: number,
  yAxisEnd: number
): void {
  // Draw x-axis
  const tickYear = 1900; // any year
  const xTicks = timeMonths(new Date(tickYear - 1, 11, 1), new Date(tickYear, 11, 31)).map(d => dateToDOY(tickYear, d));

  const xAxisTicks = axisBottom(xScale)
    .tickValues(xTicks)
    .tickFormat(() => '');

  const xAxisLabels = axisBottom(xScale)
    .tickValues(xTicks.map(tickValue => tickValue + 15)) // put labels on the 15th of each month
    .tickSize(0)
    .tickPadding(5)
    .tickFormat(t =>
      moment()
        .dayOfYear(+t)
        .format(width >= 740 ? 'MMMM' : 'MM')
    );
  g.append('g').attr('transform', `translate(0, ${yAxisEnd})`).call(xAxisTicks);
  g.append('g').attr('transform', `translate(0, ${yAxisEnd})`).call(xAxisLabels);

  // draw x-axis helper lines
  g.selectAll('.tickGrid')
    .data(xTicks.slice(1))
    .enter()
    .append('line')
    .attr('x1', d => xScale(d.valueOf()))
    .attr('x2', d => xScale(d.valueOf()))
    .attr('y1', () => yAxisStart)
    .attr('y2', () => yAxisEnd)
    .attr('stroke', () => 'grey')
    .attr('stroke-width', 0.2)
    .attr('stroke-dasharray', '5,5')
    .style('opacity', 1)
    .attr('fill', 'none');
}

export function dateToDOY(year: number, date: Date) {
  const mdate = moment(date);

  if (mdate.year() < year) {
    // date lies in the past year or beyond
    return (
      mdate.dayOfYear() -
      moment({ year: year - 1 })
        .endOf('year')
        .dayOfYear()
    );
  } else if (mdate.year() > year) {
    // date lies in the next year
    return mdate.dayOfYear() + moment({ year: year }).endOf('year').dayOfYear();
  } else {
    return mdate.dayOfYear();
  }
}
