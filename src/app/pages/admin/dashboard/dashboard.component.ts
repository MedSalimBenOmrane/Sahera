import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
ngAfterViewInit(): void {
    this.loadChartScript();
  }

  loadChartScript() {
    const script = document.createElement('script');
    script.src = '/assets/js/chart.js';
    script.onload = () => this.initializeCharts();
    document.body.appendChild(script);
  }

  initializeCharts() {
    // Your JavaScript code goes here, or call functions from your chart.js file.
  }
}
