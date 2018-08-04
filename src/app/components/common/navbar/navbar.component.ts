import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { ChatService } from "../../../services/chat.service";
import { AccountService } from "../../../services/account.service";
import { IssuesService } from "../../../services/issues.service";
import { ContactsService } from "../../../services/contacts.service";
import { TicketsService } from "../../../services/tickets.service";
import { PushNotificationsService } from "ng-push";
import { OktaAuthService } from "@okta/okta-angular";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {

  public chatConn;
  public currentPropertyManager:any = {};
  public messageCounter =
  {
    unassigned: 0,
    assigned: 0
  }
  public unread_messages: any = 0;
  public date: Date = new Date();
  public calendarsettings = {
    bigBanner: true,
    timePicker: true,
    format: "dd-MM-yyyy hh:mm a",
    defaultOpen: false
  };
  public vendorlist = [];
  public vendorselectedItems = [];
  public vendorsettings = {};
  public issuelist = [];
  public issueselectedItems = [];
  public issuesettings = {};
  public residentlist = [];
  public residentselectedItems = [];
  public residentsettings = {};
  public taskDescription = "";

  public newTaskForm;

  constructor(
    private router: Router,
    private _notificationsService: NotificationsService,
    private _push: PushNotificationsService,
    private oktaAuth: OktaAuthService,
    private chat: ChatService,
    private account: AccountService,
    private issues: IssuesService,
    private contacts: ContactsService,
    private tasks: TicketsService
  ) {
    this.oktaAuth
      .getUser()
      .then(user => {
        user.email;
        this.account.getAccountData(user.email).subscribe(accountData => {
          //console.log(user)
          //console.log(accountData)
          if(!accountData)
          {
            alert(`You've access this platform with the email ${user.email}, however, you need active account to interact with the platform. Please contact Jack support.`)
          }
          else
          {
            this.currentPropertyManager = accountData;
            localStorage.setItem('propertyManagerData', JSON.stringify(accountData));
            this.contacts.getContacts(this.currentPropertyManager['_id'],'vendors').subscribe(listVendors => {
              var vendorsList = [];
              for(var v in listVendors['vendorsResult']) vendorsList.push({
                "id": listVendors['vendorsResult'][v]._id,
                "itemName": `${listVendors['vendorsResult'][v]['vendorData']['name']} (${listVendors['vendorsResult'][v]['vendorData']['jobType']})`
              })
              this.vendorlist = vendorsList;
            })
            this.contacts.getContacts(this.currentPropertyManager['_id'],'users').subscribe(listResidents => {
              var residentsList = [];
              for(var r in listResidents['usersResult']) residentsList.push({
                "id": listResidents['usersResult'][r]._id,
                "itemName": `${listResidents['usersResult'][r]['firstName']} ${listResidents['usersResult'][r]['lastName']}`
              })
              this.residentlist = residentsList;
            })
          }

        })
      })
      .catch(error => {
        this.router.navigate(["login"]);
      });
  }

  ngOnInit() {

    this.vendorsettings = {
      singleSelection: false,
      text: "Select Vendors",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      badgeShowLimit: 2
    };
    this.issuesettings = {
      singleSelection: true,
      text: "Select Issues",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      badgeShowLimit: 2
    };
    this.residentsettings = {
      singleSelection: true,
      text: "Select Resident",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      badgeShowLimit: 2
    };
    this.chatConn = this.chat
      .getMessages()
      .map((message: any) => {
        return message.body;
      })
      .subscribe((msg_body: string) => {
        var incoming_message;
        try {
          var nlu_obj = JSON.parse(msg_body);
          incoming_message = nlu_obj;
        } finally {
          console.log(incoming_message);

          if(incoming_message)
          {
            this.chat.checkIncomingMessage(incoming_message.threadId, this.currentPropertyManager._id)
            .subscribe(messageStatus => {
              console.log(messageStatus['status'])
              switch(messageStatus['status'])
              {
                case "unattended":
                case "attended_by_me":
                  this.unread_messages = "New!"
                  this._push
                    .create("New message from resident", {
                      icon:
                        "https://scontent.fmex3-1.fna.fbcdn.net/v/t1.0-1/p50x50/31326812_163089087703705_3588846289191503395_n.png?_nc_cat=0&_nc_eui2=AeFGlGoRkE6nBxIJS6YAw3n2AzVxrF5cJV9GRoVdSKF_9IvOENAwTOSitBbj1NBPuyqYcWf-K-2n3OX_jua9shAYWj-BuZughEEUVksbDKYsQQ&oh=278db548787764531dc14478690c2be7&oe=5BB86A03",
                      body: "A resident send a message to Jack. Please help them."
                    })
                    .subscribe(
                      res => console.log(res),
                      err => this._push.requestPermission()
                    );

                    this.unread_messages = this.chat.getNewMessagesCount();
                    this._notificationsService.html(
                      "A resident request help",
                      "would you like to attend them?",
                      {
                        timeOut: 5000,
                        showProgressBar: true,
                        pauseOnHover: false,
                        clickToClose: true,
                        maxLength: 15
                      }
                    );

                  break;
                default:
              }
            });
          }
        }
      });
      this.issues.getIssues().subscribe(listIssues => {
        var issueListNav = [];
        for(var i in listIssues) issueListNav.push({
          "id": listIssues[i]._id,
          "itemName": listIssues[i].issueToken
        })
        this.issuelist = issueListNav;
      });
  }

  async logout() {
    localStorage.setItem('propertyManagerData',null);
    await this.oktaAuth.logout("/login");
  }

  ngOnDestroy() {
    if(this.chatConn) this.chatConn.unsubscribe();
  }

  public broadcastNewTask()
  {
    /*
    console.log(this.date)
    console.log(this.issueselectedItems)
    console.log(this.vendorselectedItems)
    console.log(this.residentselectedItems)
    console.log(this.taskDescription)
    */
    if(
      this.residentselectedItems.length > 0 &&
      this.issueselectedItems.length > 0 &&
      this.vendorselectedItems.length > 0
    )
    {
      var arrayVendors = [];
      for(var v in this.vendorselectedItems)
      {
        arrayVendors.push(this.vendorselectedItems[v]['id'])
      }

      this.tasks.createTicket({
        "relatedOccupant": this.residentselectedItems[0]['id'],
        "relatedIssue": this.issueselectedItems[0]['id'],
        "scheduledFor": this.date,
        "relatedManager": this.currentPropertyManager.task_id,
        "to": "vendorsArray",
        "toValue": arrayVendors,
        "description": this.taskDescription
      }, this.currentPropertyManager['_id']).subscribe(result => {
        //console.log(result)
      });
    }

  }

  public cancelNewTask()
  {
    this.date = new Date();
    this.issueselectedItems = [];
    this.vendorselectedItems = [];
    this.residentselectedItems = [];
    this.taskDescription = "";
  }

}
