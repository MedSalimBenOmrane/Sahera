import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, GenderDistribution } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
  @ViewChild('myPieChart', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  public chart: any;
  

  constructor(private dashboardService: DashboardService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.dashboardService.getGenderDistribution().subscribe(
      (data: GenderDistribution) => this.createChart(data),
      err => console.error('Erreur lors du chargement des données :', err)
    );
  }

  private createChart(data: GenderDistribution): void {
    const ctx = document.getElementById('MyPieChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Femmes', 'Hommes'],
        datasets: [{
          label: 'Répartition par genre',
          data: [data.Femme, data.Homme],
          backgroundColor: [
            'rgb(255, 0, 55)',   // Femmes
            'rgb(0, 153, 255)'   // Autre
          ],
          hoverOffset: 4
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: 'black' }
          }
        }
      }
    });
  }
}
