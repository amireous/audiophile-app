import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/data.model';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  productList: Product[] = [];
  title: any;
  currentPath!: string;
  arr = [1, 4, 5, 6, 7, 8];

  zx9SpeakerData: any;
  zx7SpeakerData: any;
  ngOnInit(): void {
    this.setCurrentRoute();
  }

  getHomeData() {
    this.dataService.getHomeData().subscribe((data) => {
      this.productList = data;
      this.getCurrentPathData(this.currentPath);
    });
  }

  setCurrentRoute() {
    this.route.params.subscribe((params) => {
      this.currentPath = params.id;
      this.getHomeData();
    });
  }

  getCurrentPathData(path: string = 'home') {
    if (path === 'speakers') path = 'speaker';
    if (path.includes('home')) return;
    this.productList = this.productList
      .slice()
      .filter((product: any) => product.slug.includes(path))
      .reverse();
  }
}
