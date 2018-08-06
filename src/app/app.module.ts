import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRouting } from "./app.routes";
import { SocketIoModule, SocketIoConfig } from "ng-socket-io";
import { HttpModule } from "@angular/http";
import { ReactiveFormsModule } from '@angular/forms';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown'
import { OktaAuthModule, OktaCallbackComponent } from "@okta/okta-angular";

import {
  DropzoneModule,
  DROPZONE_CONFIG,
  DropzoneConfigInterface
} from "ngx-dropzone-wrapper";
import {
  LocationStrategy,
  HashLocationStrategy,
  PathLocationStrategy
} from "@angular/common";
import { SimpleNotificationsModule } from "angular2-notifications";
import { PushNotificationsModule } from "ng-push";
import { StompService, StompConfig } from "@stomp/ng2-stompjs";

import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/common/navbar/navbar.component";
import { FooterComponent } from "./components/common/footer/footer.component";
import { LoginComponent } from "./components/session/login/login.component";
import { MessagesComponent } from "./components/messages/messages.component";
import { HomeComponent } from "./components/home/home.component";
import { AutomationsComponent } from "./components/automations/automations.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ContactsComponent } from "./components/contacts/contacts.component";

import { ChatService } from "./services/chat.service";
import { TicketsService } from "./services/tickets.service";
import { environment } from "../environments/environment";
import { RelativeDatePipe } from "./pipes/relative-date.pipe";
import { ContactsService } from "./services/contacts.service";
import { AccountService } from './services/account.service';
import { IssuesService } from "./services/issues.service";

const oktaConfig = {
  issuer: "https://dev-825764.oktapreview.com/oauth2/default",
  redirectUri: `${environment.self_host}/implicit/callback`,
  clientId: "0oaeu3zgonjGZw0qE0h7"
};

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: "https://httpbin.org/post",
  maxFilesize: 50,
  acceptedFiles: ".csv"
};

const stompConfig: StompConfig = {
  url: "ws://broker.247jack.com:15674/ws",
  headers: {
    login: "user",
    passcode: "7ojs2IaGvXM6"
  },
  heartbeat_in: 0,
  heartbeat_out: 30000,
  reconnect_delay: 10000,
  debug: false
};

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    MessagesComponent,
    HomeComponent,
    AutomationsComponent,
    ContactsComponent,
    RelativeDatePipe
  ],
  imports: [
    AppRouting,
    BrowserModule,
    HttpModule,
    DropzoneModule,
    BrowserAnimationsModule,
    OktaAuthModule.initAuth(oktaConfig),
    SimpleNotificationsModule.forRoot(),
    PushNotificationsModule,
    AngularDateTimePickerModule,
    AngularMultiSelectModule,
    ReactiveFormsModule
  ],
  providers: [
    ContactsService,
    ChatService,
    AccountService,
    TicketsService,
    IssuesService,
    StompService,
    {
      provide: StompConfig,
      useValue: stompConfig
    },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: DROPZONE_CONFIG, useValue: DEFAULT_DROPZONE_CONFIG }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
