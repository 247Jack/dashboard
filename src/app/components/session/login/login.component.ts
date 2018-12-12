import { Component, OnInit } from "@angular/core";
import { OktaAuthService } from "@okta/okta-angular";
import { AccountService } from '../../../services/account.service';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  oktaSignIn;
  constructor(private okta: AccountService, public oktaAuth: OktaAuthService) {
    this.oktaSignIn = okta.getWidget();
    console.log(this.oktaSignIn)
  }

  ngOnInit() {
    if(this.oktaSignIn) this.oktaSignIn.remove()
    this.oktaSignIn.renderEl({el: '#okta-login-container'}, (response) => {
      if(response.status === "SUCCESS") this.login();
    });
  }

  login() {
    this.oktaAuth.loginRedirect("/");
  }
}
