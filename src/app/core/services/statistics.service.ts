import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { Observable, of, tap } from 'rxjs';
import { StatisticsByDay } from '../models/statistics/StaticByDay';
import { LeadsStatus } from '../models/statistics/statusLeads';
import { ChartOptions } from 'src/app/components/charts/column/column.component';
import { StatisticsByDayDetail } from '../models/statistics/StaticByDayDetail';
import { HealthStatistics} from '../models/statistics/HealtStatic';
import { statusMapping } from '../models/statistics/statusMapping';



@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  constructor() { }


  //#region metodos de conexion con la base
  getStatisticsLeads(period: string, workflowId: number): Observable<StatisticsByDay[]> {
    const params = {
      workflowId: workflowId,
      period: period
    };

    return this.http
      .get<StatisticsByDay[]>(this.baseUrl + endpoints.STATISTICS_LEADS, { params })
      .pipe(tap((result) => console.log(result)));
  }
  getStatisticsHealthinvoices(period: string, healthServiceId: number): Observable<StatisticsByDay[]> {
    const params = {
      healthServiceId: healthServiceId,
      period: period
    };
    console.log(period, healthServiceId);
    
    return this.http
      .get<StatisticsByDay[]>(this.baseUrl + endpoints.STATISTICS_HEALTH_INVOICES, { params })
      .pipe(tap((result) => console.log(result)));
  }

  //#endregion

  //#region metodos de conversion de datos

    convertToColumnChartOptions(data: StatisticsByDay[] | HealthStatistics[]): Partial<ChartOptions> {

      //if (data.length === 0) return {};
      if ('details' in data[0]) { // StatisticsByDay
        const categories = this.getCategoriesStatisticsByDay(data as StatisticsByDay[]);
        const emptySeries = this.getSeries(categories, data as StatisticsByDay[]);
        const chartCategories = this.getDays(data as StatisticsByDay[]);
        const series = this.updateSeriesWithData(data as StatisticsByDay[], emptySeries, categories, chartCategories);
        return this.GetColumnChartOptions(chartCategories, series, 500, '80%');
        
      } else if ('statusName' in data[0]) { // HealthStatistics
        const translatedData = (data as HealthStatistics[]).map(item => ({
          ...item,
          statusName: statusMapping[item.statusName] || item.statusName // Mapea a español
        }));
        const chartCategories = this.getCategoriesHealt(translatedData);
        const series = this.getSeriesDataHealtInvoices(translatedData, chartCategories);
        return this.GetColumnChartOptions(chartCategories, series, 800, '60%');
      }
      return this.GetColumnChartOptions([], []);
    }

  
    convertToLineChartOptions(data: StatisticsByDay[]): Partial<ChartOptions> {
    
      const categories = this.getCategoriesStatisticsByDay(data);
      const emptySeries = this.getSeries(categories, data);
      const days = this.getDays(data)
      const series = this.updateSeriesWithData(data, emptySeries, categories, days);

      const chartOptions: Partial<ChartOptions> = {
        series: series,
        chart: {
          height: 300,
          type: 'line',
          fontFamily: 'DM Sans, sans-serif',
          foreColor: '#a1aab2',
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 3,
          strokeColors: 'transparent',
        },
        stroke: {
          curve: 'straight',
          width: 2,
        },
        colors: ['#398bf7', '#06d79c', '#ff4560'],
        legend: {
          show: false,
        },
        grid: {
          show: true,
          strokeDashArray: 0,
          borderColor: 'rgba(0,0,0,0.1)',
        },
        xaxis: {
          type: 'category',
          categories: days,
        },
        tooltip: {
          theme: 'dark',
        },
      };

      return chartOptions;
    }

    convertToBigLineChartOptions(data: StatisticsByDay[]): Partial<ChartOptions> {

      const categories = this.getCategoriesStatisticsByDay(data);
      const emptySeries = this.getSeries(categories, data);
      const days = this.getDays(data);
      const series = this.updateSeriesWithData(data, emptySeries, categories, days);
      
      const chartOptions: Partial<ChartOptions> = {
        series: series,
        chart: {
          height: 400,
          type: 'line',
          fontFamily: 'DM Sans, sans-serif',
          foreColor: '#a1aab2',
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 4,
          strokeColors: '#fff',
          hover: {
            size: 7,
          },
        },
        stroke: {
          curve: 'smooth',
          width: 7,
        },
        colors: ['#398bf7', '#06d79c', '#ff4560', '#775dd0', '#feb019'],
        grid: {
          show: false,
          strokeDashArray: 0,
          borderColor: 'rgba(0,0,0,0.1)',
        },
        xaxis: {
          type: 'category',
          categories: days,
          labels: {
            show: true,
            rotate: -45,
            style: {
              fontSize: '12px',
              fontFamily: 'DM Sans, sans-serif',
            },
          },
          axisBorder: {
            show: true,
            color: '#a1aab2',
          },
        },
        tooltip: {
          theme: 'dark',
        },
      };
      return chartOptions;
    }

    convertStaticsToAcumulateStatics(StatisticsByDay: StatisticsByDay[]): StatisticsByDay[] {
      
      const accumulatedStatisticss: StatisticsByDay[] = JSON.parse(JSON.stringify(StatisticsByDay));
      const categories = this.getCategoriesStatisticsByDay(StatisticsByDay);
      const accumulatedCounts: { [status: number]: number } = {};
      
      accumulatedStatisticss.forEach((dayData: StatisticsByDay) => {
        dayData.details.forEach((detail: StatisticsByDayDetail) => {
          const statusName = detail.activityGrupoName;

          const categoryIndex = categories.indexOf(statusName);
          
          if (!accumulatedCounts[categoryIndex]) {
            accumulatedCounts[categoryIndex] = 0;
          }

          accumulatedCounts[categoryIndex] += detail.count;

          detail.count = accumulatedCounts[categoryIndex];
        });
      });

      return accumulatedStatisticss;
    }


  //#endregion


  //#region getData

    private getSeries(categories: string[], data: any[]) { 
      const series: { name: string; data: number[] }[] = categories.map((category, index) => ({
        name: category, // Usar el nombre de la categoría en lugar de LeadsStatus
        data: Array(data.length).fill(0),
      }));
      return series;
    }

    private getDays(data: any[]) {
      const days = data.map(item => {
        const date = new Date(item.day);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      return days;
    }

    private updateSeriesWithData(
      data: StatisticsByDay[],
      series: { name: string; data: number[] }[],
      categories: string[],
      days: string[]
    ): any[] {
      const seriesCopy = series.map(serie => ({
        name: serie.name,
        data: [...serie.data],
      }));
      
      data.forEach((item: StatisticsByDay) => {
        item.details.forEach((detail: StatisticsByDayDetail) => {
          const statusName = detail.activityGrupoName;

          const categoryIndex = categories.indexOf(statusName);

          if (categoryIndex !== -1) {
            const dayIndex = days.indexOf(
              `${new Date(item.day).getMonth() + 1}/${new Date(item.day).getDate()}`
            );
            
            if (dayIndex !== -1) {
              seriesCopy[categoryIndex].data[dayIndex] += detail.count;
            }
          }
        });
      });

      return seriesCopy;
    }


    private getSeriesDataHealtInvoices(data: HealthStatistics[],categories: string[]): { name: string; data: number[] }[] {
      
      const series: { name: string; data: number[],description:string[] }[] = data.map( healtStatistic => ({
        name: healtStatistic.statusName,
        data: Array(categories.length).fill(0), 
        description: Array(categories.length).fill('')
      }));
  
      data.forEach((item,index) => {
        const categoryIndex = categories.indexOf(item.statusName);
        if (categoryIndex !== -1) {
          series[index].data[categoryIndex] += item.count; // Sumar el count en la posición correspondiente
          
          // Formatear el total como moneda
          const formattedTotal = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'ARS',
          }).format(item.total);
          
          series[index].description[categoryIndex] += `(${formattedTotal})`;
        }
      });
      return series;
      

    }

    private getCategoriesStatisticsByDay(data: StatisticsByDay[]): string[] {
      if (data.length === 0) return [];

      return data[0].details.map(detail => detail.activityGrupoName); 
    }
    private getCategoriesHealt(data: HealthStatistics []): string[] {
      if (data.length === 0) return [];

      return data.map(detail => detail.statusName); 
    }
 //#endregion
  

  //#region GetChartConfig

  private GetColumnChartOptions(days: string[], series: any[], height: number = 500, columnWidth : string = '80%' ): Partial<ChartOptions> {
    const chartOptions: Partial<ChartOptions> = {
      series,
      chart: {
        type: 'bar',
        stacked: true,
        height: height,
      },
      xaxis: {
        categories: days,
      },
      plotOptions: {
        bar: {
          columnWidth: columnWidth,
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number, opts) {
          const serie = series[opts.seriesIndex];
          if (serie.description && serie.description[opts.dataPointIndex]) {
            return `${val}\n${serie.description[opts.dataPointIndex]}`;
          }
          return val.toString();
        },
        style: {
          fontSize: '12px'
        }
      },
      colors: ['#398bf7', '#06d79c', '#ff4560', '#775dd0', '#feb019', '#e16f00', '#808080', '#00ffff', '#8a2be2', '#ffd700'],
      grid: {
        show: false,
      },
      tooltip: {
        y: {
          formatter: function(val: number, opts) {
            const serie = series[opts.seriesIndex];
            if (serie.description && serie.description[opts.dataPointIndex]) {
              return `${val} ${serie.description[opts.dataPointIndex]}`;
            }
            return val.toString();
          }
        }
      }
    };

    return chartOptions;
  }


  //#endregion

}
