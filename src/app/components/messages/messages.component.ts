import {
  Component,
  AfterViewChecked,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnInit
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { ChatService } from "../../services/chat.service";
import { AccountService } from "../../services/account.service";
import { ContactsService } from "../../services/contacts.service";
import { StompService } from "@stomp/ng2-stompjs";
import * as _ from "lodash";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"]
})

export class MessagesComponent implements OnInit, AfterViewInit, AfterViewChecked {

  private chatConn;
  private contactConn;
  private chatListConn;
  private chatPastConn;

  public userId: String;
  public service: String = "";
  public key: String = "";
  public users = [];
  public messages = [];
  public user:any;
  public threadId = "";
  public teammatelist = [];
  public teammateselectedItems = [];
  public teammatesettings = {};
  private currentPropertyManager: any;
  public humanTakeover:Boolean = false;

  @ViewChild("chatScroll") private myScrollContainer: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private chat: ChatService,
    private account: AccountService,
    private contacts: ContactsService
  ) {}

  ngOnInit() {

      this.currentPropertyManager = JSON.parse(localStorage.getItem('propertyManagerData'));

      this.teammatesettings = {
        singleSelection: false,
        text: "Select Teammate",
        selectAllText: "Select All",
        unSelectAllText: "UnSelect All",
        enableSearchFilter: true,
        badgeShowLimit: 2
      };

      this.contactConn = this.contacts.getContacts(this.currentPropertyManager['_id'],'pms').subscribe(listPMs => {
        var PMlist = [];
        for(var pm in listPMs['pManagersResult']) PMlist.push({
          "id": listPMs['pManagersResult'][pm]._id,
          "itemName": `${listPMs['pManagersResult'][pm]['name']} ${listPMs['pManagersResult'][pm]['surname']}`
        })
        this.teammatelist = PMlist;
      })
      this.chat.clearNewMessagesCount();
      this.chatConn = this.chat
        .listenMessages(this.currentPropertyManager)
        .map((message: any) => {
          return message;
        })
        .subscribe((incoming_message) => {
          console.log(this.userId)
          console.log(this.service)
          console.log(incoming_message)
          if (incoming_message["userId"] && incoming_message["platform"]) {
              //setTimeout(() => {
                this.messages.push(incoming_message);
                this.scrollToBottom();
              //}, 10);
          }
        });
      this.chatListConn = this.chat.getMessagesList(this.currentPropertyManager._id).subscribe(data => {
        console.log(data)
        this.users = [];
        for (var i in data) {
          data[i].initials = data[i].firstName[0] + data[i].lastName[0];
          data[i]._id = data[i].composedKey.split(":")[0];
          data[i].firstName = data[i].firstName.split(" ")[0];
          data[i].lastName = data[i].lastName.split(" ")[0];
          this.users.push(data[i]);
        }
      });
      this.activatedRoute.params.subscribe(params => {
        this.activatedRoute.queryParams.subscribe(queryparams => {
          this.userId = params["userId"];
          this.service = queryparams["service"];
          this.key = queryparams["key"];
          if (this.userId) {
            this.chatPastConn = this.chat.getPastMessages(this.userId, this.service, this.currentPropertyManager._id).subscribe(
              data => {
                console.log(data)
                this.messages = data.messages;
                this.user = data;
                this.humanTakeover = data.threads[0]['humanTakeover'];
                this.threadId = data.threads[0]['_id'];
                this.scrollToBottom();
              },
              error => {
                console.log(error);
              }
            );
          }
        });
      });


  }

  ngAfterViewInit(){

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if(this.chatConn) this.chatConn.unsubscribe();
    if(this.contactConn) this.contactConn.unsubscribe();
    if(this.chatListConn) this.chatListConn.unsubscribe();
    if(this.chatPastConn) this.chatPastConn.unsubscribe();
  }

  sendMessage(e) {
    if (!!e.value.trim()) {
      var messageData = {
        platform: this.service,
        content: e.value,
        uid: this.key,
        userId: this.userId,
        direction: "out",
        timestamp: new Date(),
        threadId: "",
        originalMsg: e.value,
        originalRequest: {},
        meta: {}
      };
      console.log(messageData)
      e.value = "";
      this.messages.push(messageData);
      this.chat.sendMessage(messageData).subscribe(
        data => {
          console.log(data);
          this.chat.getMessagesList(this.currentPropertyManager._id).subscribe(data => {
            this.users = [];
            for (var i in data) {
              data[i].initials = data[i].firstName[0] + data[i].lastName[0];
              data[i]._id = data[i].composedKey.split(":")[0];
              data[i].firstName = data[i].firstName.split(" ")[0];
              data[i].lastName = data[i].lastName.split(" ")[0];
              this.users.push(data[i]);
            }
          });
          this.scrollToBottom();
        },
        error => {
          //console.log(error);
        }
      );
      //console.log(messageData);
      //console.log("Message sended");
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  setHumanTakeover(){
    console.log(this.humanTakeover)
    console.log(this.threadId)
    let arrayPMs = (this.humanTakeover) ? [this.currentPropertyManager._id] : []
    this.chat.assignTeammate(arrayPMs,this.threadId)
    .subscribe(resultAssing => {
      console.log(resultAssing);
    })
  }

  isSelected(userID)
  {
    if(userID === this.userId) return ".8rem";
    return ".7rem";
  }

}
