import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-root",
  template: `
  <div *ngIf="!isLogin; else login" class="app" id="app">
    <app-navbar></app-navbar>
    <router-outlet ></router-outlet>
  </div>
  <ng-template #login>
    <router-outlet ></router-outlet>
  </ng-template>  
  `,
  styleUrls: ["./app.component.css"]
})

export class AppComponent {
  title: String = "Jack";
  path: String;
  isLogin: boolean;
  constructor(private router: Router) {
    router.events.subscribe(val => {
      this.path = window.location.pathname;
      this.isLogin = this.path.includes('login');
    });
  }
}
