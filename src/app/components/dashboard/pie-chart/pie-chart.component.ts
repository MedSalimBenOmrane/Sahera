import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, GenderDistribution } from 'src/app/services/dashboard.service';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
  @ViewChild('myPieChart', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  public chart: any;
  

  constructor(private dashboardService: DashboardService, private i18n: TranslationService) {
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
        labels: [this.i18n.translate('dashboard.gender.female'), this.i18n.translate('dashboard.gender.male')],
        datasets: [{
          label: this.i18n.translate('dashboard.genderDistributionTitle'),
          data: [data.Femme, data.Homme],
          backgroundColor: [
            'rgb(255, 0, 55)',
            'rgb(0, 153, 255)'
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
