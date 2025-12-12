import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, ThematiqueProgress } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  public chart: Chart | undefined;
  chartWidth = 0;                 // ➜ largeur défilable

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    Chart.register(...registerables);

    this.dashboardService.getThematiquesProgress().subscribe(
      (data: ThematiqueProgress[]) => {
        const labels      = data.map(t => t.name);
        const incompletes = data.map(t => t.incomplete_count);
        const completes   = data.map(t => t.completed_count);

        // largeur “élastique” : ~100 px par thématique (min 600)
        const MIN_COL_W = 120;
        this.chartWidth = Math.max(800, labels.length * MIN_COL_W);

        // détruire l'ancien graphe si présent
        this.chart?.destroy();

        this.chart = new Chart('MyChart', {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Non complété', data: incompletes, backgroundColor: 'rgba(255, 0, 0, 0.6)' },
              { label: 'Complété',     data: completes,   backgroundColor: 'rgba(0, 128, 0, 0.6)' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,    // ➜ respecte la hauteur du wrapper
            plugins: {
             
              legend: { labels: { color: 'black' } }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Nombre d’utilisateurs' }
              },
              x: {
                title: { display: true, text: 'Thématique' },
                ticks: { autoSkip: false, maxRotation: 0 } // pas de skip des labels
              }
            }
          }
        });
      },
      err => console.error('Erreur chargement progression thématiques :', err)
    );
  }
}
