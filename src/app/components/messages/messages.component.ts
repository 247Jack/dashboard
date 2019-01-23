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
import { ModalComponent } from 'dsg-ng2-bs4-modal/ng2-bs4-modal';
import * as _ from "lodash";
import { defaultKeyValueDiffers } from "@angular/core/src/change_detection/change_detection";

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
  public currentPropertyManager: any;
  public currentCompany: String = ""
  public humanTakeover: Boolean = false;
  public userListLoaded:Boolean = false;
  public isUserUnknown = false;
  public newAddress;
  public serviceDataId;
  @ViewChild("chatScroll")
  private myScrollContainer: ElementRef;
  updateMessages: any;
  @ViewChild('modalmessage')
  modal: ModalComponent;
  public targetContactId = "";
  public targetPhone = "";
  public tenantsList = [];
  public vendorsList = [];
  public tenantsListSelectedItems = [];
  public vendorsListSelectedItems = [];
  public contactListSettings = {
    singleSelection: true,
    text: 'Select',
    enableSearchFilter: true
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private chat: ChatService,
    private contacts: ContactsService,
    private autopopulate: AutopopulateService
  ) {}

  ngOnInit() {
    
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        sessionStorage.getItem("propertyManagerData")
      );
      this.currentCompany = sessionStorage.getItem("PMcompany")
      if (this.currentPropertyManager && this.currentCompany) {
        clearInterval(waitForPMData);
        this.contactConn = this.contacts
        .getContacts(this.currentPropertyManager["_id"], this.currentCompany, "")
        .subscribe(listUsers => {
          var PMlist = [];
          for (var pm in listUsers["pManagersResult"])
            PMlist.push({
              id: listUsers["pManagersResult"][pm]._id,
              itemName: `${listUsers["pManagersResult"][pm]["name"]} ${
                listUsers["pManagersResult"][pm]["surname"]
              }`
            });
          this.teammatelist = PMlist;
          for (var t in listUsers["usersResult"])
            this.tenantsList.push({
              id: listUsers["usersResult"][t]._id,
              itemName: `${listUsers["usersResult"][t]["firstName"]} ${
                listUsers["usersResult"][t]["lastName"]
              }`
            });
          for (var v in listUsers["vendorsResult"])
          this.vendorsList.push({
            id: listUsers["vendorsResult"][v]._id,
            itemName: listUsers["vendorsResult"][v]["vendorData"]["name"]
          });
        });
        this.chat.clearNewMessagesCount();
        this.chatConn = this.chat
          .listenMessages(this.currentPropertyManager, this.currentCompany)
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
          .getMessagesList(this.currentPropertyManager._id, this.currentCompany)
          .subscribe(data => {
            this.userListLoaded = true;
            this.users = [];
            for (var i in data) {
              var names = data[i].name.split(" ")
              data[i].initials = (data.rank === "jack") ? '' : (names.length > 1) ? `${names[0][0]}${names[1][0]}`: names[0][0]
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
                      this.currentPropertyManager._id,
                      this.currentCompany
                    )
                    .subscribe(
                      data => {
                        this.userType = data.userType
                        this.messages = data.messages;
                        this.isUserUnknown = (!data.userStatus.enabled && data.userStatus.tempId !== null)
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
                  this.router.navigate(["/messages", this.userId], { queryParams: { service : "sms" }, queryParamsHandling: "merge"});
                }
              }
            });
          });
      }
    }, 100);

    this.teammatesettings = {
      singleSelection: false,
      text: "Select Teammate",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      badgeShowLimit: 2
    };
    
    this.updateMessages = this.autopopulate.changeMessages.subscribe(UpdateMessagess =>{
      this.messages = UpdateMessagess
    })
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
    if (this.updateMessages)this.updateMessages.unsubscribe();
  }

  sendMessage(e) {
    if (!!e.value.trim()) {
      var initialsPM = (this.currentPropertyManager.rank === "jack") ? '' : `${this.currentPropertyManager.name[0]}${this.currentPropertyManager.surname[0]}`
      var messageData = {
        platform: (this.service === "alexa") ? "sms": this.service,
        content: e.value,
        uid: this.key,
        userId: this.userId,
        userType: this.userType,
        company: this.currentCompany,
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
    if (userID === this.userId && service === this.service) return "list-item list-item-selected";
    return "list-item";
  }

  dispatch(messageId, serviceData) {
    this.activatedRoute.params.subscribe(params => {
      this.serviceDataId = params.userId
    })
    serviceData.service = this.service
    serviceData.id = this.serviceDataId
    serviceData.messageId = messageId
    if(serviceData){
      this.autopopulate.sendService(serviceData)
    }
    document.getElementById("setNewOrder").click();
  }

  userFromMessage(target, userId, userPhone){
    switch(target){
      case 'new':
        
        break;
      case 'existing':
        if(!userId){
          this.modal.open()
        } else {
          this.router.navigate(['/contacts', userId], {queryParamsHandling: 'merge'})
        }
        break;
      default:
    }
  }

  addNewContact(){
    this.router.navigate(['/contacts', this.userId])
  }

  addExisitngContact(userPhone){
    this.targetPhone = userPhone;
    this.modal.open();
  }

  selectExistingContact(){
    switch(this.userType){
      case 'tenant':
        if(this.tenantsListSelectedItems.length){
          var tenant = this.tenantsListSelectedItems[0]
          this.router.navigate(['/contacts', tenant.id], {queryParams: {new_phone : this.targetPhone}, queryParamsHandling: 'merge'})
        }
      break;
      case 'vendor':
        if(this.vendorsListSelectedItems.length){
          var vendor = this.vendorsListSelectedItems[0]
          this.router.navigate(['/contacts', vendor.id], {queryParams: {new_phone : this.targetPhone}, queryParamsHandling: 'merge'})
        }
      break;
      default:
    }
  }

}
