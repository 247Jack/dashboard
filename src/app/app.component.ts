import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
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
