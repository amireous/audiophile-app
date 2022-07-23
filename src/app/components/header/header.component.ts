import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  title: any = '';
  isHomeRoute: boolean = true;
  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.url.includes('home') || val.urlAfterRedirects.includes('home')) {
          console.log('checkccc');
          this.isHomeRoute = true;
        } else {
          this.isHomeRoute = false
          console.log(val, 'falseeee')
        }

        if (val.url.includes('headphones')) this.title = 'headphones';
        if (val.url.includes('speakers')) this.title = 'speakers';
        if (val.url.includes('earphones')) this.title = 'earphones';
      }
    });
  }

  onRouterLink(navigatedRoute: string) {
    if (navigatedRoute === 'home') {
      this.isHomeRoute = true;
    } else this.isHomeRoute = false;
  }
}
