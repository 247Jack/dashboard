import {
  Component,
  AfterViewChecked,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnInit
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ChatService } from "../../services/chat.service";
import { ContactsService } from "../../services/contacts.service";
import { AutopopulateService } from "../../services/autopopulate.service";
import * as _ from "lodash";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"]
})
export class MessagesComponent
  implements OnInit, AfterViewInit, AfterViewChecked {
  private chatConn;
  private contactConn;
  private chatListConn;
  private chatPastConn;

  public userId: String;
  public userType: String;
  public userInitials: String;
  public service: String = "";
  public key: String = "";
  public users = [];
  public messages = [];
  public user: any;
  public threadId = "";
  public teammatelist = [];
  public teammateselectedItems = [];
  public teammatesettings = {};
  private currentPropertyManager: any;
  public humanTakeover: Boolean = false;
  public userListLoaded:Boolean = false;
  public newAddress;
  @ViewChild("chatScroll")
  private myScrollContainer: ElementRef;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private chat: ChatService,
    private contacts: ContactsService,
    private autopopulate: AutopopulateService
  ) {}

  ngOnInit() {
    this.currentPropertyManager = JSON.parse(
      localStorage.getItem("propertyManagerData")
    );

    this.teammatesettings = {
      singleSelection: false,
      text: "Select Teammate",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      badgeShowLimit: 2
    };

    this.contactConn = this.contacts
      .getContacts(this.currentPropertyManager["_id"], "pms")
      .subscribe(listPMs => {
        var PMlist = [];
        for (var pm in listPMs["pManagersResult"])
          PMlist.push({
            id: listPMs["pManagersResult"][pm]._id,
            itemName: `${listPMs["pManagersResult"][pm]["name"]} ${
              listPMs["pManagersResult"][pm]["surname"]
            }`
          });
        this.teammatelist = PMlist;
      });
    this.chat.clearNewMessagesCount();
    this.chatConn = this.chat
      .listenMessages(this.currentPropertyManager)
      .subscribe(
        incoming_message => {
          if (incoming_message["userId"] === this.userId && incoming_message["platform"] === this.service) {
            var targetUser = _.findIndex(this.users, o => {return o['composedKey'] === `${incoming_message['userId']}:${incoming_message['platform']}`})
            if(targetUser >= 0)
            {
              this.users[targetUser].lastMessage.content = incoming_message['content'];
              this.messages.push(incoming_message);
              setTimeout(() => {
                this.scrollToBottom();
                document.getElementById("invisibletriggerbutton").click();
                document.getElementById("messageBox").click();
              },50)
            }
          }
          else
          {
            var targetUser = _.findIndex(this.users, o => {return o['composedKey'] === `${incoming_message['userId']}:${incoming_message['platform']}`})
            if(targetUser >= 0)
            {
              this.users[targetUser].unread = true;
              this.users[targetUser].lastMessage.content = incoming_message['content'];
              setTimeout(() => {
                document.getElementById("invisibletriggerbutton").click();
              },50)
            }
          }
        },
        error => {
          console.log(error);
        }
      );
    this.chatListConn = this.chat
      .getMessagesList(this.currentPropertyManager._id)
      .subscribe(data => {
        this.userListLoaded = true;
        this.users = [];
        for (var i in data) {
          var names = data[i].name.split(" ")
          data[i].initials = (names.length > 1) ? `${names[0][0]}${names[1][0]}`: names[0][0]
          data[i]._id = data[i].composedKey.split(":")[0];
          this.users.push(data[i]);
        }
      });
    this.activatedRoute.params.subscribe(params => {
      this.activatedRoute.queryParams.subscribe(queryparams => {
        this.userId = params["userId"];
        this.service = queryparams["service"];
        //this.key = queryparams["key"];
        if (this.userId) {
          if(this.service)
          {
            this.spinnerService.show();
            this.chatPastConn = this.chat
              .getPastMessages(
                this.userId,
                this.service,
                this.currentPropertyManager._id
              )
              .subscribe(
                data => {
                  this.userType = data.userType
                  this.messages = data.messages;
                  for(var i in this.messages){
                    if (this.messages[i].address) {
                      if (this.messages[i].address.address) {
                        this.newAddress = this.messages[i].address.address.replace(/\s+/g, '+') + "+" + this.messages[i].address.city
                      }
                    }
                  }
                  switch(data.userType){
                    case "tenant":
                      this.user = data.tenantData
                      this.userInitials = data.tenantData.firstName[0] + data.tenantData.lastName[0];
                      this.key = (this.service === "alexa") ? data.tenantData.app["sms"] : data.tenantData.app[`${this.service}`];
                    break;
                    case "vendor":
                      this.user = data.vendorData
                      this.userInitials = data.vendorData.name[0]
                      this.key = data.vendorData.phone
                    break;
                    default:
                  }
                  this.humanTakeover = (data.threads.length && this.service !== "alexa") ? data.threads[0]["humanTakeover"] : true;
                  this.threadId = (data.threads.length) ? data.threads[0]["_id"] : "";
                  this.scrollToBottom();
                  this.spinnerService.hide();
                  var waitForUsersData = setInterval(() => {
                    if (this.userListLoaded) {
                      clearInterval(waitForUsersData);
                      var currentUserIndex = _.findIndex(this.users, o => {
                        return (o['composedKey'] === `${this.userId}:${this.service}`)
                      });
                      if(currentUserIndex >= 0)
                      {
                        this.users[currentUserIndex].unread = false;
                      }
                    }
                  }, 100);
                },
                error => {
                  console.log(error);
                }
              );
          }
          else{
            this.router.navigate(["/messages", this.userId], { queryParams: { service : "sms" }});
          }
        }
      });
    });
  }

  ngAfterViewInit() {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chat.closeSocket();
    if (this.chatConn) this.chatConn.unsubscribe();
    if (this.contactConn) this.contactConn.unsubscribe();
    if (this.chatListConn) this.chatListConn.unsubscribe();
    if (this.chatPastConn) this.chatPastConn.unsubscribe();
  }

  sendMessage(e) {
    if (!!e.value.trim()) {
      var initialsPM = `${this.currentPropertyManager.name[0]}${this.currentPropertyManager.surname[0]}`
      var messageData = {
        platform: (this.service === "alexa") ? "sms": this.service,
        content: e.value,
        uid: this.key,
        userId: this.userId,
        userType: this.userType,
        company: this.currentPropertyManager.company,
        direction: "out",
        attendBy: this.currentPropertyManager._id,
        initials: initialsPM,
        timestamp: new Date(),
        threadId: "",
        originalMsg: e.value,
        originalRequest: {},
        meta: {}
      };
      e.value = "";
      this.messages.push(messageData);
      this.chat.sendMessage(messageData).subscribe(
        data => {
          /*
          this.chat
            .getMessagesList(this.currentPropertyManager._id)
            .subscribe(data => {
              this.users = [];
              for (var i in data) {
                data[i].initials = data[i].firstName[0] + data[i].lastName[0];
                data[i]._id = data[i].composedKey.split(":")[0];
                data[i].firstName = data[i].firstName.split(" ")[0];
                data[i].lastName = data[i].lastName.split(" ")[0];
                this.users.push(data[i]);
              }
            });
            */
          this.scrollToBottom();
        },
        error => {
          console.log(error);
        }
      );
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  setHumanTakeover() {
    let arrayPMs = this.humanTakeover ? [this.currentPropertyManager._id] : [];
    this.chat
      .assignTeammate(this.currentPropertyManager._id, arrayPMs, this.threadId)
      .subscribe(resultAssing => {
      });
  }

  isSelected(userID, service) {
    if (userID === this.userId && service === this.service) return "#EEEEEE";
    return "#FFFFFF";
  }

  dispatch(serviceData) {
    if(serviceData){
      this.autopopulate.sendService(serviceData)
    }
    document.getElementById("setNewOrder").click();
  }
}
