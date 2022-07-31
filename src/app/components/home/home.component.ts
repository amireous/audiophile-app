import { Component, HostListener, OnInit } from '@angular/core';
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
  innerWidth!: number;

  earphonesData: any;
  speakersData: any;

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.setCurrentRoute();
  }

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
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

  getCurrentPathData(path: string = 'speaker') {
    if (path === 'speakers') path = 'speaker';
    this.speakersData = this.productList.filter((product: any) =>
      product?.category?.includes('speakers')
    );
    this.earphonesData = this.productList.filter((product: any) =>
      product?.category?.includes('earphones')
    );
    this.productList = this.productList.filter((product: any) =>
      product?.slug?.includes(path)
    );
  }

  onSeeProduct(product: Product) {
    this.router.navigate(['/', 'product-detail', product?.slug]);
  }
}
