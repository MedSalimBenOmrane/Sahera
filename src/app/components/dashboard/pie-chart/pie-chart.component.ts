import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
  public chart: any;

  createChart() {
    const ctx = document.getElementById('MyPieChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Female', 'Male'],
        datasets: [{
          label: 'Distribution des Tumeurs',
          data: [60, 40], // 60% femmes, 40% hommes
          backgroundColor: [
            'rgb(255, 0, 55)', // Couleur pour Femmes
            'rgb(0, 153, 255)' // Couleur pour Hommes
          ],
          hoverOffset: 4
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: 'black' // Change label color to white
            }
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
