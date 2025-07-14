import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, ThematiqueProgress } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
 public chart: any;

  constructor(private dashboardService: DashboardService) {
   
  }

  ngOnInit(): void {
     Chart.register(...registerables);
    this.dashboardService.getThematiquesProgress().subscribe(
      (data: ThematiqueProgress[]) => {
        console.log(data);
        const labels      = data.map(t => t.name);
        const incompletes = data.map(t => t.incomplete_count);
        const completes   = data.map(t => t.completed_count);

        // Détruit l'ancien chart si présent
        if (this.chart) {
          this.chart.destroy();
        }

        this.chart = new Chart('MyChart', {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Non complété',
                data: incompletes,
                backgroundColor: 'rgba(255, 0, 0, 0.6)'  // rouge
              },
              {
                label: 'Complété',
                data: completes,
                backgroundColor: 'rgba(0, 128, 0, 0.6)' // vert
              }
            ]
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Progression des thématiques',
                color: 'black',
                font: { size: 16 },
                padding: { top: 10, bottom: 30 }
              },
              legend: {
                labels: { color: 'black' }
              }
            },
            aspectRatio: 2.5,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Nombre d’utilisateurs' }
              },
              x: {
                title: { display: true, text: 'Thématique' }
              }
            }
          }
        });
      },
      err => {
        console.error('Erreur chargement progression thématiques :', err);
      }
    );
  }
}