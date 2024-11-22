import { Component, inject, NgModule, OnInit } from '@angular/core';
import { StatisticsService } from 'src/app/core/services/statistics.service';
import { AppColumnChartComponent, ChartOptions } from '../../charts/column/column.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormsModule, NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SidenavService } from 'src/app/core/services/sidenav.service';
import { Subscription } from 'rxjs';
import { AppLineChartComponent } from '../../charts/line/line.component';
import { WorkFlowService } from 'src/app/core/services/work-flow.service';
import { WellKnownWorkflowTypes } from 'src/app/core/models/workflows/WellKnownWorkflowTypes';
import { SessionService } from 'src/app/core/services/session.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AppColumnChartComponent, NgSelectComponent, FormsModule, MatIconModule, AppLineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  statisticsService = inject(StatisticsService)
  private sidenavService = inject(SidenavService);
  private workflowService = inject(WorkFlowService);
  private sessionService = inject(SessionService);
  statisticsForColumnChart: Partial<ChartOptions>;
  statisticsForLineChart: Partial<ChartOptions>;

  selectedMonth = '01';
  selectedYear = '24';
  months = [
    { value: '01', text: 'Enero' },
    { value: '02', text: 'Febrero' },
    { value: '03', text: 'Marzo' },
    { value: '04', text: 'Abril' },
    { value: '05', text: 'Mayo' },
    { value: '06', text: 'Junio' },
    { value: '07', text: 'Julio' },
    { value: '08', text: 'Agosto' },
    { value: '09', text: 'Septiembre' },
    { value: '10', text: 'Octubre' },
    { value: '11', text: 'Noviembre' },
    { value: '12', text: 'Diciembre' },
  ];
  titleChartColumn = 'Leads por dia en el mes de '
  titleAccumulateChart = 'Leads acumulados en el mes de '
  
  // Crea un array de 10 años comenzando desde 2024, donde cada elemento es un objeto con propiedades 'text' y 'value'
  // Por ejemplo: [{text: '2024', value: '2024'}, {text: '2025', value: '2025'}, etc]
  years = Array.from({ length: 10 }, (_, i) => ({ text: (2024 + i).toString(), value: (2024 + i).toString() }));
  private sidenavSubscription: Subscription | undefined;
  workFlows: any[] = [];
  selectedWorkFlowId: number = -1;

  ngOnInit(): void {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();
    this.selectedMonth = currentMonth;
    this.selectedYear = currentYear;
    this.sessionService.workFlows$.subscribe((workFlows: any) => {
      this.workFlows = workFlows.filter((workFlow: any) => workFlow.workflowType == WellKnownWorkflowTypes.LeadApproval);
      if (this.workFlows.length > 0) {
        this.selectedWorkFlowId = this.workFlows[0].workflowId;
        this.updateColumnChart();
      }
    });
    // manejo de visualizacion para cuando se oculta o muestra el sidenav
    this.sidenavSubscription = this.sidenavService.sidenavCollapsed$.subscribe(() => {
      // le doy una pequeña pasusa para que espera a que se acomode la pantalla 
      setTimeout(() => {
        this.updateColumnChart();
      }, 20);
    });
  


  }



  setColumnChart(period: string) {  
    this.statisticsService.getStatisticsLeads(period, this.selectedWorkFlowId).subscribe(data => {
      this.statisticsForColumnChart = this.statisticsService.convertToColumnChartOptions(data);
      this.statisticsForLineChart = this.statisticsService.convertToBigLineChartOptions(this.statisticsService.convertStaticsToAcumulateStatics(data));
      
    });
  }

  updateColumnChart() {
    let period = this.selectedYear + this.selectedMonth;
    let nameMonth = this.months.find(m => m.value == this.selectedMonth)?.text;
    this.titleChartColumn = nameMonth ? 'Leads por dia en el mes de: ' + nameMonth : this.titleChartColumn;
    this.titleAccumulateChart = nameMonth ? 'Leads acumulados en el mes de: ' + nameMonth : this.titleAccumulateChart;
    this.setColumnChart(period)
  }



}
