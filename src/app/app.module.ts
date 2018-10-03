import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRouting } from "./app.routes";
import { HttpModule } from "@angular/http";
import { ReactiveFormsModule } from "@angular/forms";
import { AngularDateTimePickerModule } from "angular2-datetimepicker";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown/angular2-multiselect-dropdown";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { Ng2SearchPipeModule } from "ng2-search-filter";

import { OktaAuthModule } from "@okta/okta-angular";
import {
  DropzoneModule,
  DROPZONE_CONFIG,
  DropzoneConfigInterface
} from "ngx-dropzone-wrapper";
import { LocationStrategy, PathLocationStrategy } from "@angular/common";
//import { SimpleNotificationsModule } from "angular2-notifications";
//import { PushNotificationsModule } from "ng-push";
import { ModalModule } from "dsg-ng2-bs4-modal/ng2-bs4-modal";
import { Ng4LoadingSpinnerModule } from "ng4-loading-spinner";

//import { StompService, StompConfig } from "@stomp/ng2-stompjs";

import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/common/navbar/navbar.component";
import { FooterComponent } from "./components/common/footer/footer.component";
import { LoginComponent } from "./components/session/login/login.component";
import { MessagesComponent } from "./components/messages/messages.component";
import { HomeComponent } from "./components/home/home.component";
import { AutomationsComponent } from "./components/automations/automations.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ContactsComponent } from "./components/contacts/contacts.component";
import { CompanyComponent } from "./components/company/company.component";
import { BroadcastComponent } from './components/broadcast/broadcast.component';

import { ChatService } from "./services/chat.service";
import { TicketsService } from "./services/tickets.service";
import { environment } from "../environments/environment";
import { RelativeDatePipe } from "./pipes/relative-date.pipe";
import { ContactsService } from "./services/contacts.service";
import { AccountService } from "./services/account.service";
import { IssuesService } from "./services/issues.service";
import { CompanyService } from "./services/companies.service";
import { BroadcastService } from "./services/broadcast.service";
import { AutopopulateService } from "./services/autopopulate.service";

const oktaConfig = {
  issuer: "https://dev-825764.oktapreview.com/oauth2/default",
  redirectUri: `${environment.self_host}/implicit/callback`,
  clientId: environment.okta_clientId
};

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: "https://httpbin.org/post",
  maxFilesize: 50,
  acceptedFiles: ".csv"
};

//const SocketConfig: SocketIoConfig = { url: environment.socket_host, options: {secure:environment.secureSocket} };

/*
const stompConfig: StompConfig = {
  url: environment.broker_host,
  headers: {
    login: environment.broker_user,
    passcode: environment.broker_pass
  },
  heartbeat_in: 0,
  heartbeat_out: 30000,
  reconnect_delay: 10000,
  debug: false
};
*/

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
    RelativeDatePipe,
    CompanyComponent,
    BroadcastComponent
  ],
  imports: [
    AppRouting,
    BrowserModule,
    HttpModule,
    DropzoneModule,
    BrowserAnimationsModule,
    OktaAuthModule.initAuth(oktaConfig),
    //SimpleNotificationsModule.forRoot(),
    //PushNotificationsModule,
    AngularDateTimePickerModule,
    AngularMultiSelectModule,
    ReactiveFormsModule,
    Ng4LoadingSpinnerModule.forRoot(),
    ModalModule,
    NgxDatatableModule,
    Ng2SearchPipeModule
  ],
  providers: [
    ContactsService,
    ChatService,
    AccountService,
    TicketsService,
    IssuesService,
    CompanyService,
    BroadcastService,
    AutopopulateService,
    /*
    StompService,
    {
      provide: StompConfig,
      useValue: stompConfig
    },
    */
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: DROPZONE_CONFIG, useValue: DEFAULT_DROPZONE_CONFIG }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
