import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, EthnicityDistribution } from 'src/app/services/dashboard.service';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {
  public chart: any;

  constructor(private dashboardService: DashboardService, private i18n: TranslationService) {
    Chart.register(...registerables);
  }

  private createChart(data: EthnicityDistribution): void {
    const ctx = document.getElementById('MyLineChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: this.i18n.translate('dashboard.gender.female'),
            data: data.Femme,
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 0, 55)',
            pointBackgroundColor: 'rgb(255, 0, 55)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 0, 55)'
          },
          {
            label: this.i18n.translate('dashboard.gender.male'),
            data: data.Homme,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(0, 153, 255)',
            pointBackgroundColor: 'rgb(0, 153, 255)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(0, 153, 255)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.i18n.translate('dashboard.ethnicityTitle'),
            color: 'black',
            font: { size: 16 },
            padding: { top: 10, bottom: 30 }
          },
          legend: {
            labels: { color: 'black' }
          }
        },
        elements: {
          line: {
            borderWidth: 3,
            borderColor: 'black'
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true,
              color: 'black'
            },
            grid: {
              color: 'black',
              lineWidth: 1
            },
            pointLabels: {
              color: 'black',
              font: { size: 12 }
            },
            ticks: {
              color: 'black',
              backdropColor: 'rgba(0, 0, 0, 0)',
              font: { size: 10 }
            }
          }
        }
      }
    });
  }
  ngOnInit(): void {
    this.dashboardService.getEthnicityDistribution()
      .subscribe((data: EthnicityDistribution) => {
        this.createChart(data);
      }, err => {
        console.error('Erreur lors du chargement des données :', err);
      });
  }
}
