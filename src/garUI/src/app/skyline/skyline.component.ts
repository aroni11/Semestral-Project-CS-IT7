import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-skyline',
  templateUrl: './skyline.component.html',
  styleUrls: ['./skyline.component.css']
})
export class SkylineComponent implements OnInit {

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
  }

  drawSkyline(data: object[]) {
    if (data === undefined || data.length === 0) {
      this.snackBar.open('Cannot draw the skyline', null, {
        duration: 5000
      });
      return;
    }
    d3.select('app-skyline svg').remove();

    const margin = {top: 20, right: 20, bottom: 30, left: 40};

    const svg = d3.select('app-skyline').append('svg')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const ratio = Math.max(...data.map((costs) => costs['road_cost'])) / 100;
    const series = data.map((costs) => ({
      x: costs['distance'],
      y: costs['time'],
      z: Math.round(costs['road_cost'] / ratio) // normalize
    }));

    // Add the x-axis
    svg.append('g')
      .attr('class', 'x axis');

    // Add the y-axis
    svg.append('g')
      .attr('class', 'y axis');

    // Add the points
    svg.append('g')
      .attr('class', 'series')
      .style('fill', 'white')
      .selectAll('.point')
      .data(series)
      .enter().append('circle')
      .attr('class', 'point')
      .attr('r', (d) => d.z / 10);

    const draw = function() {
      const mainFrameWidth = (d3.select('mat-sidenav-content').node() as HTMLElement).getBoundingClientRect().width;
      const toolbarHeight = (d3.select('mat-toolbar').node() as HTMLElement).getBoundingClientRect().height;
      const mainFrameHeight = (d3.select('mat-sidenav-content').node() as HTMLElement).getBoundingClientRect().height - toolbarHeight;

      const width = mainFrameWidth - margin.left - margin.right;
      const height = mainFrameHeight - margin.top - margin.bottom;

      const x = d3.scaleLinear()
        .range([0, width]);

      const y = d3.scaleLinear()
        .range([height, 0]);

      x.domain(d3.extent(series, (d) => d['x'])).nice();
      y.domain(d3.extent(series, (d) => d['y'])).nice();

      d3.select('app-skyline svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      d3.select('g.x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

      d3.select('g.y')
        .call(d3.axisLeft(y));

      d3.selectAll('circle')
        .attr('cx', (d) => x(d['x']))
        .attr('cy', (d) => y(d['y']));
    };

    draw();

    d3.select(window).on('resize', draw);
  }
}
