import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { TicketsService } from "../../services/tickets.service";
import { IssuesService } from "../../services/issues.service";

@Component({
  selector: 'app-wo',
  templateUrl: './wo.component.html',
  styleUrls: ['./wo.component.css']
})
export class WoComponent implements OnInit {

  public tickets;
  public time;
  public date;
  public currentPropertyManager;
  public currentCompany;
  public currentTicket;
  public limitRows = 8;
  public recivedData;
  issuelist: any;
  issueToken: any;
  issue: any;
  selectedRow = [];
  selected = [];
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService,
    private issues: IssuesService
  ) {}

  ngOnInit() {
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        sessionStorage.getItem("propertyManagerData")
      );
      this.currentCompany = sessionStorage.getItem("PMcompany")
      if (this.currentPropertyManager && this.currentCompany) {
        clearInterval(waitForPMData);
        this.loadTasks();
        this.ticket.update.subscribe(updating => {
          this.loadTasks();
        });
      }
    }, 100);
    this.recivedData = this.issues.senddata.subscribe(data =>{
      this.issuelist = data
      for (const i in this.issuelist) {
        if(this.issue = this.issuelist[i].id){
          console.log("iguales")
        }
      }
    })
  }

  public checkPendientTask(event, task) {
    this.currentTicket = task;
  }

  public evaluateTask(response) {
    this.ticket
      .evaluateTaskThreshold(
        this.currentTicket._id,
        response,
        this.currentPropertyManager._id
      )
      .subscribe(data => {
        this.loadTasks()
      });
  }

  private loadTasks(){
    this.spinnerService.show();
    this.ticket
    .getTickets(this.currentPropertyManager["_id"], this.currentCompany)
    .subscribe(data => {
      console.log(data)
      this.spinnerService.hide();
      this.tickets = data;
      this.tickets.reverse()
      for (let i in this.tickets) {
        this.date = this.tickets[i].creationDate.split("T")[0];
        this.time = this.tickets[i].creationDate.split(/\.|\T/)[1];
        for(var e in this.tickets[i].relatedIssue){
          this.issue = this.tickets[i].relatedIssue[e]._id
        }
      }
    });
  }
  onChange(deviceValue) {
    this.limitRows = deviceValue;
  }
  onSelect({ selected }) {
    this.selectedRow = selected[0]
    document.getElementById("editRow").click();
  }
  cancelEdit(){
    this.selected = []
  }
}
