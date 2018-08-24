import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
//import { StompService } from "@stomp/ng2-stompjs";
//import { Socket } from 'ng-socket-io';
import * as io from 'socket.io-client';

import { environment } from "../../environments/environment";

@Injectable()
export class ChatService {
  public new_messages = 0;
  private socket;

  constructor(
    //private socket: Socket,
    //private _stompService: StompService,
    private http: Http
  ) {}

  public sendMessage(messageObject: any) {
    if (messageObject["platform"]) {
      return this.http
        .post(
          `${environment.api_domain}/messaging/senders/${
            messageObject["platform"]
          }`,
          messageObject
        )
        .map(res => {
          return res.json();
        })
        .catch(error => {
          return error;
        });
    }
  }

  /*
  stomp_subscription = this._stompService.subscribe(
    "/exchange/jack-middleware-to-dashboard"
  );
  */

  public listenMessages(pm) {
    let observable = new Observable(observer => {
      this.socket = io(environment.socket_host, {secure:true});
      this.socket.on('user-login',(data) => {
        this.socket.emit('login', {
          propertyManagerId: pm._id,
          company: pm.company
        })
      })
      this.socket.on(`jack-broker-to-dahsboard|${pm.company}`, (data) => {
        observer.next(data);    
      });
      return () => {
        this.socket.disconnect();
      };  
    })     
    return observable;
    /*
    console.log(this.socket)
    this.socket.emit('login', {
      propertyManagerId: pm._id,
      company: pm.company
    })
    return this.socket
      .fromEvent(`jack-broker-to-dahsboard|${pm.company}`)
      .map(data => data);
    */
  }

  public getMessages() {

    /*
    this.new_messages = this.new_messages + 1;
    return this.stomp_subscription;
    */
  }

  public getNewMessagesCount() {
    return this.new_messages;
  }

  public clearNewMessagesCount() {
    this.new_messages = 0;
  }

  public getMessagesList(pm_id) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });

    return this.http
      .get(
        `${environment.api_domain}/dashboard/messages`,
        options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }

  public closeSocket(){
    this.socket.disconnect();
  }

  public getPastMessages(userId, service, pm_id) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/messages/${userId}?service=${service}`,
        options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }

  public checkIncomingMessage(threadId, pm_id){
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/messages/checkthread/${threadId}`,
        options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }

  public assignTeammate(listTeam,threadId)
  {
    return this.http.post(
      `${environment.api_domain}/dashboard/messages`,
      {
        listPMs: listTeam,
        threadId: threadId
      }
    )
    .catch(error => {
      return Observable.throw(error.message || error);
    });
  }
}
