import { Component, OnInit } from "@angular/core";
import { OktaAuthService } from "@okta/okta-angular";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  constructor(public oktaAuth: OktaAuthService) {}

  ngOnInit() {}

  login() {
    this.oktaAuth.loginRedirect("/");
  }
}
