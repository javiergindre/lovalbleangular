import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { StatisticsService } from 'src/app/core/services/statistics.service';
import { AppColumnChartComponent } from '../../charts/column/column.component';
import { AppLineChartComponent } from '../../charts/line/line.component';
import { LookupComponent, LookupConfig } from '../../lookup/lookup.component';
import { endpoints } from 'src/app/core/helpers/endpoints';
import { environment } from 'src/environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { SidenavService } from 'src/app/core/services/sidenav.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-integrations',
  templateUrl: './dashboard-integrations.component.html',
  styleUrls: ['./dashboard-integrations.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AppColumnChartComponent,
    ReactiveFormsModule, 
    LookupComponent,
    NgSelectModule
  ]
})
export class DashboardIntegrationsComponent implements OnInit {
  dateFrom: Date;
  dateTo: Date;
  healthServices: any[] = [];
  selectedHealthService: any = 1;
  healthServiceForm: FormGroup;
  statisticsForColumnChart: any;
  statisticsForLineChart: any;
  titleChartColumn: string = 'Estadísticas de facturas en el mes de';

  
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
  years = Array.from({ length: 10 }, (_, i) => ({ text: (2024 + i).toString(), value: (2024 + i).toString() }));
  selectedMonth: string = '01';
  selectedYear: string = '24';
  private sidenavService = inject(SidenavService);
  private sidenavSubscription: Subscription | undefined;

  healthServiceIdLookupConfig : LookupConfig = {
    placeholder: 'Obra social',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES}?filter=0`,
    showAddNew: false,
    errorMessage: 'Seleccione una obra social',
  };

  constructor(private statisticsService: StatisticsService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    this.healthServiceForm = this.fb.group({
      HealthServiceId: [1]
    });
  }

  ngOnInit() {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();
    this.selectedMonth = currentMonth;
    this.selectedYear = currentYear;

    this.sidenavSubscription = this.sidenavService.sidenavCollapsed$.subscribe(() => {
      setTimeout(() => {
        this.updateDataCharts();
      }, 20);
    });
    
  }

  updateCharts(period: string) {
    if(this.selectedHealthService != -1){
      this.statisticsService.getStatisticsHealthinvoices(period, this.selectedHealthService).subscribe(data => {
      
        this.statisticsForColumnChart = this.statisticsService.convertToColumnChartOptions(data);
      
      });
    }
  }


  updateDataCharts() {
    let period = this.selectedYear + this.selectedMonth;
    let nameMonth = this.months.find(m => m.value == this.selectedMonth)?.text;
    this.titleChartColumn = nameMonth ? 'Estadisticas de facturas en el mes de ' + nameMonth : this.titleChartColumn;
    this.updateCharts(period)
  }

  onHealthServiceChange(event: any){
    this.selectedHealthService = event.id;
  }
}
