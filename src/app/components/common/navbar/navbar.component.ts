import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
//import { NotificationsService } from "angular2-notifications";
//import { PushNotificationsService } from "ng-push";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ChatService } from "../../../services/chat.service";
import { AccountService } from "../../../services/account.service";
import { IssuesService } from "../../../services/issues.service";
import { ContactsService } from "../../../services/contacts.service";
import { TicketsService } from "../../../services/tickets.service";
import { AutopopulateService } from "../../../services/autopopulate.service";
import { environment } from "../../../../environments/environment";
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
  private autoPopulateConn;
  public validTask = false;
  public canSwitchCompany = false;

  public currentPropertyManager: any = {};
  public messageCounter = {
    unassigned: 0,
    assigned: 0
  };
  public unread_messages: any = 0;
  public date: Date = new Date();
  public calendarsettings = {
    bigBanner: true,
    timePicker: false,
    format: "dd-MM-yyyy",
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
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private oktaAuth: OktaAuthService,
    private chat: ChatService,
    private account: AccountService,
    private issues: IssuesService,
    private contacts: ContactsService,
    private tasks: TicketsService,
    private autopopulate: AutopopulateService
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
              this.unread_messages = accountData.unread.length - 1
              /*
              Storage of vendors and tenants to desplay in the "New task" modal.
            */
              var validDoms = environment.validEmailDom.split('|')
              var email = (accountData) ? accountData.email.split('@')[1] : "none"
              for (var vd in validDoms) {
                if (validDoms[vd] === email) {
                  this.canSwitchCompany = true;
                  break;
                }
              }
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
                .getIssues(this.currentPropertyManager["_id"])
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
                  if (
                    incoming_message && incoming_message['direction'] === 'in'
                  ) {
                    if (window['Push']) {
                      window['Push'].create("A resident made a request", {
                        body: "A resident send a message to Jack. Please help them.",
                        icon: 'assets/images/Notification_logo.png',
                        requireInteraction: true,
                        onClick: function () {
                          window.focus();
                          this.close();
                          window.location.href = `/messages/${incoming_message['userId']}?service=${incoming_message['platform']}`
                        }
                      });
                      setTimeout(() => {
                        document.getElementById("invisibletriggerbuttonNav").click();
                      }, 25)
                    }
                  }
                  else if(incoming_message && incoming_message['coreLogic'])
                  {
                    if (window['Push']) {
                      window['Push'].create("An issue requires validation!", {
                        body: "A task requires to be evaluated. Please check it.",
                        icon: 'assets/images/Notification_logo.png',
                        requireInteraction: true,
                        onClick: function () {
                          window.focus();
                          this.close();
                        }
                      });
                      setTimeout(() => {
                        document.getElementById("invisibletriggerbuttonNav").click();
                      }, 25)
                    }
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
      text: "Select",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      badgeShowLimit: 2
    };
    this.issuesettings = {
      singleSelection: true,
      text: "Select",
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
    if (window['Push']) {
      if (!window['Push'].Permission.has()) {
        window['Push'].Permission.request(() => {
          console.log(window['Push'].Permission.has());
        }, () => {
          console.log(window['Push'].Permission.has());
        });
      }
    }
    this.autoPopulateConn = this.autopopulate.change.subscribe(serviceData => {
      this.issueselectedItems = [];
      this.date = new Date(serviceData.dateIssue.replace(/-/g, '\/'))
      console.log(serviceData)
      this.activatedRoute.params.subscribe(params => {
        serviceData.tenantId = params.userId 
      })
      var flagNoTenant = true;
      for(var t in this.residentlist){
        if(this.residentlist[t].id === serviceData.tenantId){
          this.residentselectedItems = [this.residentlist[t]]
          flagNoTenant = false;
          break;
        }
      }
      //var flagNoIssue = true;
      for(var i in this.issuelist){
        if(this.issuelist[i].itemName === serviceData.contentIssue){
          this.issueselectedItems = [this.issuelist[i]]
          //flagNoIssue = false
          break;
        }
      }
      this.taskDescription = serviceData.problem
      if(
        !serviceData.problem
        || flagNoTenant
        // || flagNoIssue
        ){
          this.modalShowMessage("CLP00010")
        }

    });
  }

  /*
    Kills current session
  */
  async logout() {
    localStorage.setItem("propertyManagerData", null);
    if(this.chatConn){
      this.chat.closeSocket();
      this.chatConn.unsubscribe();
    }
    if(this.oktaAuth){
      await this.oktaAuth.logout("/login");
    } else {
      window.location.href = "/login";
    }
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
    if (this.autoPopulateConn) this.autoPopulateConn.unsubscribe();
  }

  public broadcastNewTask() {
    if (
      this.residentselectedItems.length > 0 &&
      this.issueselectedItems.length > 0 &&
      this.vendorselectedItems.length > 0
    ) {
      var arrayVendors = [];
      for (var v in this.vendorselectedItems) {
        arrayVendors.push(this.vendorselectedItems[v]["id"]);
      }
      this.spinnerService.show();
      this.tasks
        .createTicket(
          {
            relatedOccupant: this.residentselectedItems[0]["id"],
            relatedIssue: this.issueselectedItems[0]["id"],
            scheduledFor: this.date,
            relatedManager: this.currentPropertyManager.task_id,
            toValue: arrayVendors,
            ticketDescription: this.taskDescription
          },
          this.currentPropertyManager["_id"]
        )
        .subscribe(result => {
          //console.log(result);
          this.spinnerService.hide();
          this.validTask = true;
          document.getElementById("cancelTask").click();
          if ((result.status = 200)) {
            this.modalShowMessage("Success");
            this.tasks.updateDashoboard();
          } else {
            this.modalShowMessage("SystemError");
          }
        });
    } else {
      this.modalShowMessage("EmptyField");
    }
  }

  public modalShowMessage(messageType) {
    switch (messageType) {
      case "CLP00010": {
        this.modalTitle = "Oops!";
        this.modalBody = "Something went wrong on our end. Nothing terrible; however, you will need to enter the request information. Error #CLP00010";
        break;
      }
      case "Success": {
        this.modalTitle = "Success";
        this.modalBody = "Your service order has been submitted successfully";
        break;
      }
      case "SystemError": {
        this.modalTitle = "System Error";
        this.modalBody = "Oops! It looks like something went wrong on our side. Please try again. If the issue remains, send us a note at support@247jack.com";
        break;
      }

      case "EmptyField": {
        this.modalTitle = "Empty field";
        this.modalBody = "Oops! It looks like we missing some important information in the contact ";
        break;
      }
      default: {
        this.modalTitle = "Oops!";
        this.modalBody = "Something went wrong on our end. Nothing terrible; however, you will need to enter the request information.";
        break;
      }
    }
    this.modal.open();
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