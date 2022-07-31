import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(private router: Router) {}

  currentPath: string = 'home';

  ngOnInit(): void {
    this.getCurrentPath();
  }

  onRouterLink() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 90);
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

  getCurrentPath() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.currentPath = val.url;

        if (this.currentPath === '/') {
          this.currentPath = val.urlAfterRedirects;
        }
      }
    });
  }
}
