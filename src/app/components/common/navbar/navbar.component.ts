import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { ChatService } from "../../../services/chat.service";
import { AccountService } from "../../../services/account.service";
import { IssuesService } from "../../../services/issues.service";
import { ContactsService } from "../../../services/contacts.service";
import { TicketsService } from "../../../services/tickets.service";
import { PushNotificationsService } from "ng-push";
import { OktaAuthService } from "@okta/okta-angular";
import { ModalComponent } from "dsg-ng2-bs4-modal";
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  @ViewChild("modalmessage")
  modal: ModalComponent;
  private chatConn;
  private getPMDataConn;
  private getVendorsConn;
  private getTenatsConn;
  private getIssuesConn;

  public currentPropertyManager: any = {};
  public messageCounter = {
    unassigned: 0,
    assigned: 0
  };
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
  public modalTitle = "";
  public modalBody = "";
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
    /*
      After invoking the constructor, method getUser() fron okta retrieves the property manager email, which is used as key to get the property manager data.
    */
    this.oktaAuth
      .getUser()
      .then(user => {
        user.email;
        this.getPMDataConn = this.account
          .getAccountData(user.email)
          .subscribe(accountData => {
            //console.log(user)
            //console.log(accountData)
            /* If user is in okta but not in the dabatase, shows a message. */
            if (!accountData) {
              alert(
                `You've access this platform with the email ${
                  user.email
                }, however, you need active account to interact with the platform. Please contact Jack support.`
              );
            } else {
              /* Storage of the current property manager data to be used in following functions. */
              this.currentPropertyManager = accountData;
              localStorage.setItem(
                "propertyManagerData",
                JSON.stringify(accountData)
              );
              /*
              Storage of vendors and tenants to desplay in the "New task" modal.
            */
              this.getVendorsConn = this.contacts
                .getContacts(this.currentPropertyManager["_id"], "vendors")
                .subscribe(listVendors => {
                  var vendorsList = [];
                  for (var v in listVendors["vendorsResult"])
                    vendorsList.push({
                      id: listVendors["vendorsResult"][v]._id,
                      itemName: `${
                        listVendors["vendorsResult"][v]["vendorData"]["name"]
                      } (${
                        listVendors["vendorsResult"][v]["vendorData"]["jobType"]
                      })`
                    });
                  this.vendorlist = vendorsList;
                });
              this.getTenatsConn = this.contacts
                .getContacts(this.currentPropertyManager["_id"], "users")
                .subscribe(listResidents => {
                  var residentsList = [];
                  for (var r in listResidents["usersResult"])
                    residentsList.push({
                      id: listResidents["usersResult"][r]._id,
                      itemName: `${
                        listResidents["usersResult"][r]["firstName"]
                      } ${listResidents["usersResult"][r]["lastName"]}`
                    });
                  this.residentlist = residentsList;
                });
              /*
              Get issues cataloge for "new Task" modal
            */
              this.getIssuesConn = this.issues
                .getIssues()
                .subscribe(listIssues => {
                  var issueListNav = [];
                  for (var i in listIssues)
                    issueListNav.push({
                      id: listIssues[i]._id,
                      itemName: listIssues[i].issueToken
                    });
                  this.issuelist = issueListNav;
                });
              /*
              Subscribes to socket.io server
            */
              this.chatConn = this.chat
                .listenMessages(this.currentPropertyManager)
                .subscribe(incoming_message => {
                  console.log(incoming_message);
                  if (
                    incoming_message &&
                    (incoming_message["typeMessage"] === "book.service" ||
                      incoming_message["typeMessage"] === "unknown")
                  ) {
                    this.chat
                      .checkIncomingMessage(
                        incoming_message["threadId"],
                        this.currentPropertyManager._id
                      )
                      .subscribe(
                        messageStatus => {
                          console.log(messageStatus["status"]);
                          /*
                    this.chatConn = this.chat
                      .listenMessages(this.currentPropertyManager)
                      .map((message: any) => {
                        return message;
                      })
                      .subscribe(incoming_message => {
                        if (
                          incoming_message &&
                          incoming_message["typeMessage"] !== "greeting"
                        ) {
                          this.chat
                            .checkIncomingMessage(
                              incoming_message.threadId,
                              this.currentPropertyManager._id
                            )
                            .subscribe(messageStatus => {
                              console.log(messageStatus["status"]);
                              /*
                            Cases of message notifications:
                              unattended: Attended by no property manager, needs to be responded by a human, so it triggers a notification.
                              attended_by_me: Attended by current property manager, so it triggers a notification.
                              attended_by_other: Attended by another propery manager, so it doesn't trigger a notification.
                      */
                          switch (messageStatus["status"]) {
                            case "unattended":
                            case "attended_by_me":
                              this.unread_messages = "New!";
                              this._push
                                .create("New message from resident", {
                                  icon:
                                    "https://scontent.fmex3-1.fna.fbcdn.net/v/t1.0-1/p50x50/31326812_163089087703705_3588846289191503395_n.png?_nc_cat=0&_nc_eui2=AeFGlGoRkE6nBxIJS6YAw3n2AzVxrF5cJV9GRoVdSKF_9IvOENAwTOSitBbj1NBPuyqYcWf-K-2n3OX_jua9shAYWj-BuZughEEUVksbDKYsQQ&oh=278db548787764531dc14478690c2be7&oe=5BB86A03",
                                  body:
                                    "A resident send a message to Jack. Please help them."
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
                                  timeOut: 100,
                                  showProgressBar: true,
                                  pauseOnHover: false,
                                  clickToClose: true,
                                  maxLength: 15
                                }
                              );

                              break;
                            default:
                          }
                        },
                        error => {
                          console.log(error);
                        }
                      );
                  }
                });
            }
          });
      })
      /*
        If no user returned from okta (or session is no longer alive) force return to login page.
      */
      .catch(error => {
        this.router.navigate(["login"]);
      });
  }

  ngOnInit() {
    /*
      Controls in the modal "New task"
    */
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
    /*
      Set of notification services
      // TODO: Change current service to listen from socket.io instead of rabbitMQ
    */
  }

  /*
    Kills current session
  */
  async logout() {
    this.chat.closeSocket();
    localStorage.setItem("propertyManagerData", null);
    await this.oktaAuth.logout("/login");
  }

  /*
    If user closes the window, unsubscribes from chat notifications.
  */
  ngOnDestroy() {
    if (this.chatConn) {
      this.chat.closeSocket();
      this.chatConn.unsubscribe();
    }
    if (this.getPMDataConn) this.getPMDataConn.unsubscribe();
    if (this.getVendorsConn) this.getVendorsConn.unsubscribe();
    if (this.getTenatsConn) this.getTenatsConn.unsubscribe();
    if (this.getIssuesConn) this.getIssuesConn.unsubscribe();
  }

  /*
    Makes a request to add a new task, given:}
      List of vendors
      ID of property relatedManager
      ID of tenant
      ID of issue
      Description
  */
  public broadcastNewTask() {
    /*
    console.log(this.date)
    console.log(this.issueselectedItems)
    console.log(this.vendorselectedItems)
    console.log(this.residentselectedItems)
    console.log(this.taskDescription)
    */
    if (
      this.residentselectedItems.length > 0 &&
      this.issueselectedItems.length > 0 &&
      this.vendorselectedItems.length > 0
    ) {
      var arrayVendors = [];
      for (var v in this.vendorselectedItems) {
        arrayVendors.push(this.vendorselectedItems[v]["id"]);
      }
      console.log(arrayVendors)
      this.tasks
        .createTicket(
          {
            relatedOccupant: this.residentselectedItems[0]["id"],
            relatedIssue: this.issueselectedItems[0]["id"],
            scheduledFor: this.date,
            relatedManager: this.currentPropertyManager.task_id,
            //to: "vendorsArray",
            toValue: arrayVendors,
            ticketDescription: this.taskDescription
          },
          this.currentPropertyManager["_id"]
        )
        .subscribe(result => {
          console.log(result);
          if ((result.status = 200)) {
            this.modalTitle = "Success";
            this.modalBody =
              "Your service order has been submitted successfully";
            this.modal.open();
          } else {
            this.modalTitle = "System Error";
            this.modalBody =
              " Oops! It looks like something went wrong on our side. Please try again. If the issue remains, send us a note at support@247jack.com";
            this.modal.open();
          }
        });
    } else {
      this.modalTitle = "Empty field";
      this.modalBody =
        "Oops! It looks like we missing some important information in the contact ";
      this.modal.open();
    }
  }

  /*
    Cancels current task and cleans modal fields
  */
  public cancelNewTask() {
    this.date = new Date();
    this.issueselectedItems = [];
    this.vendorselectedItems = [];
    this.residentselectedItems = [];
    this.taskDescription = "";
  }
}
