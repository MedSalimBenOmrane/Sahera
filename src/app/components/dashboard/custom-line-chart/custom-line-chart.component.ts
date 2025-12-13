import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AgeDistribution, DashboardService } from 'src/app/services/dashboard.service';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-custom-line-chart',
  templateUrl: './custom-line-chart.component.html',
  styleUrls: ['./custom-line-chart.component.css']
})
export class CustomLineChartComponent implements OnInit {
  private chart!: Chart;

  constructor(private dashboardService: DashboardService, private i18n: TranslationService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.dashboardService.getAgeDistribution()
      .subscribe(
        (data: AgeDistribution) => this.createChart(data),
        err => console.error('Erreur chargement distribution d’âge :', err)
      );
  }

  private createChart(data: AgeDistribution): void {
    const ctx = document.getElementById('MyLineChart_') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: this.i18n.translate('dashboard.usersLabel'),
          data: data.counts,
          fill: false,
          borderColor: 'rgb(0, 123, 255)',
          tension: 0.1,
          pointBackgroundColor: 'rgb(0, 123, 255)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(0, 123, 255)'
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: this.i18n.translate('dashboard.ageDistributionTitle'),
            color: 'black',
            font: { size: 16 },
            padding: { top: 10, bottom: 30 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: 'black' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: 'black' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      }
    });
  }
}
