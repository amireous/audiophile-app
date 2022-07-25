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

  earphonesData: any;
  speakersData: any;
  ngOnInit(): void {
    this.setCurrentRoute();
  }

  getHomeData() {
    this.dataService.getHomeData().subscribe((data) => {
      this.productList = data.reverse();
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
    console.log(path);
    if (path === 'speakers') path = 'speaker';
    this.speakersData = this.productList.filter((product) =>
      product.category.includes('speakers')
    );
    this.earphonesData = this.productList.filter((product) =>
      product.category.includes('earphones')
    );
    this.productList = this.productList.filter((product: any) =>
      product.slug.includes(path)
    );
  }

  onSeeProduct(product: Product) {
    this.router.navigate(['/', 'product-detail', product.slug]);
  }
}
