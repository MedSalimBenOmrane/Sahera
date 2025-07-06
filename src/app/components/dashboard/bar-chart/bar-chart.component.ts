import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  public chart: any;

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'bar',
      data: {
        labels: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        datasets: [
          {
            label: "Females",
            data: [120, 130, 110, 140, 150, 160, 170, 180, 190, 200, 210, 220],
            backgroundColor: 'rgba(255, 0, 55, 0.6)' // Couleur pour les femmes
          },
          {
            label: "Males",
            data: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210],
            backgroundColor: 'rgba(0, 153, 255, 0.6)' // Couleur pour les hommes
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Number of Patients per Month in 2024 by Gender', // Titre du graphique
            color: 'black',
            font: {
              size: 16,
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          legend: {
            labels: {
              color: 'black' // Couleur des étiquettes de légende
            }
          }
        },
        aspectRatio: 2.5,
        scales: {
          y: {
            beginAtZero: true // Démarre l'axe Y à zéro
          }
        }
      }
    });
  }

  ngOnInit(): void {
    Chart.register(...registerables);
    this.createChart();
  }
}
