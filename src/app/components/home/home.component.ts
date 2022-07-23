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
  ) {}
  homeData: any;
  title: any;

  zx9SpeakerData: any;
  zx7SpeakerData: any;
  ngOnInit(): void {
    this.getHomeData();
    this.setHomeTitle();
    this.route.params.subscribe((data) => {
      console.log(data);
    });
  }

  getHomeData() {
    this.dataService.getHomeData().subscribe((data) => {
      console.log(data);
      this.homeData = data;
    });
  }

  setHomeTitle() {
    console.log(this.router.url);
  }
}
