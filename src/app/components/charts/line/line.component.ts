import { Component, AfterViewInit, ViewChild, Input } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexXAxis,
  ApexTooltip,
  ApexTheme,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: any;
  theme: ApexTheme;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: string[];
  markers: any;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  labels: string[];
};
@Component({
  selector: 'chart-line',
  standalone: true,
  imports: [NgApexchartsModule, MaterialModule],
  templateUrl: './line.component.html',
})
export class AppLineChartComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  @Input() lineChartOptions: Partial<ChartOptions> | any;
  @Input() title: string = '';
  constructor() {


  }
}
