import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-barchart-analyse',
  templateUrl: './barchart-analyse.component.html',
  styleUrls: ['./barchart-analyse.component.css']
})
export class BarchartAnalyseComponent implements OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() title = 'Analyse des réponses';

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['values'] || changes['title']) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart?.destroy();
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Nombre de réponses',
          data: this.values,

          // --- “Barres en verre” ---
          backgroundColor: 'rgba(0, 255, 17, 0.28)',
          borderColor: 'rgba(0, 255, 72, 0.45)',
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          // un peu plus fines que la colonne
          barPercentage: 0.7,
          categoryPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: {
          title: {
            display: true,
            text: this.title,
            color: '#111'
          },
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { autoSkip: false, color: 'rgba(0,0,0,0.75)' },
            grid:  { color: 'rgba(0,0,0,0.08)' }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: 'rgba(0,0,0,0.75)' },
            grid:  { color: 'rgba(0,0,0,0.08)' }
          }
        }
      }
    });
  }
}
