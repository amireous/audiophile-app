import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  ) { }
  productList: any;
  title: any;
  currentPath!: string;

  zx9SpeakerData: any;
  zx7SpeakerData: any;
  ngOnInit(): void {
    this.setCurrentRoute();
  }

  getHomeData() {
    this.dataService.getHomeData().subscribe((data) => {
      this.productList = data;
      this.getCurrentPathData(this.currentPath)
    });
  }

  setCurrentRoute() {
    this.route.params.subscribe((params) => {
      console.log(params);
      this.currentPath = params.id;
      console.log(this.currentPath)
      this.getHomeData();
    });
  }

  getCurrentPathData(path: string = 'home') {
    if (path.includes('home')) return;
    this.productList = this.productList.filter((product: any) => product.slug.includes(path));
  }
}
