import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, ThematiqueProgress } from 'src/app/services/dashboard.service';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  public chart: Chart | undefined;
  chartWidth = 0;

  constructor(private dashboardService: DashboardService, private i18n: TranslationService) {}

  ngOnInit(): void {
    Chart.register(...registerables);

    this.dashboardService.getThematiquesProgress().subscribe(
      (data: ThematiqueProgress[]) => {
        const labels      = data.map(t => t.name);
        const incompletes = data.map(t => t.incomplete_count);
        const completes   = data.map(t => t.completed_count);

        const MIN_COL_W = 120;
        this.chartWidth = Math.max(800, labels.length * MIN_COL_W);

        this.chart?.destroy();

        this.chart = new Chart('MyChart', {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: this.i18n.translate('dashboard.incomplete'), data: incompletes, backgroundColor: 'rgba(255, 0, 0, 0.6)' },
              { label: this.i18n.translate('dashboard.complete'),   data: completes,   backgroundColor: 'rgba(0, 128, 0, 0.6)' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: 'black' } }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: this.i18n.translate('dashboard.usersCount') }
              },
              x: {
                title: { display: true, text: this.i18n.translate('dashboard.themeAxis') },
                ticks: { autoSkip: false, maxRotation: 0 }
              }
            }
          }
        });
      },
      err => console.error('Erreur chargement progression thématiques :', err)
    );
  }
}
