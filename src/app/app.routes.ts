import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./components/session/login/login.component";
import { OktaAuthGuard, OktaCallbackComponent } from "@okta/okta-angular";
import { HomeComponent } from "./components/home/home.component";
import { MessagesComponent } from "./components/messages/messages.component";
import { AutomationsComponent } from "./components/automations/automations.component";
import { ContactsComponent } from "./components/contacts/contacts.component";

const app_routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "implicit/callback", component: OktaCallbackComponent },
  { path: "home", component: HomeComponent, canActivate: [OktaAuthGuard] },
  {
    path: "messages",
    component: MessagesComponent,
    canActivate: [OktaAuthGuard]
  },
  {
    path: "messages/:userId",
    component: MessagesComponent,
    canActivate: [OktaAuthGuard]
  },
  {
    path: "automations",
    component: AutomationsComponent,
    canActivate: [OktaAuthGuard]
  },
  {
    path: "contacts",
    component: ContactsComponent,
    canActivate: [OktaAuthGuard]
  },
  { path: "**", pathMatch: "full", redirectTo: "home" }
];

export const AppRouting = RouterModule.forRoot(app_routes, { useHash: true });
