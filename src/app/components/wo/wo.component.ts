import { Component, OnInit, ViewChild } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { TicketsService } from "../../services/tickets.service";
import { IssuesService } from "../../services/issues.service";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from 'dsg-ng2-bs4-modal';

@Component({
  selector: 'app-wo',
  templateUrl: './wo.component.html',
  styleUrls: ['./wo.component.css']
})
export class WoComponent implements OnInit {
  @ViewChild("modalmessage")
  modal: ModalComponent;
  public tickets;
  public time;
  public date;
  public currentPropertyManager;
  public currentCompany;
  public currentTicket;
  public limitRows = 8;
  public recivedData;
  public vendorlist: any;
  public issueToken: any;
  public issue: any;
  public selectedRow = [];
  public selected = [];
  public editForm : FormGroup;
  public defaultStatus: string = 'Edit Status';
  public defaultVendor: string = 'Edit Vendor';
  public modalTitle = "";
  public modalBody = "";
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService,
    private issues: IssuesService
  ) {
    this.editForm = new FormGroup({
      status: new FormControl(null),
      vendor: new FormControl(null),
      cost: new FormControl(null),
      id: new FormControl(null)
    });
    this.editForm.controls['status'].setValue(this.defaultStatus, {onlySelf: true})
    this.editForm.controls['vendor'].setValue(this.defaultVendor, {onlySelf: true})
}

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
      this.vendorlist = data
      console.log(this.vendorlist)
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
      }
    });
  }
  onChange(deviceValue) {
    this.limitRows = deviceValue;
  }
  onSelect({ selected }) {
    this.selectedRow = selected[0]
    document.getElementById("editRow").click();
    if(selected[0]._id){
      this.editForm.controls['id'].setValue(selected[0]._id, {onlySelf: true})
    }
  }
  cancelEdit(){
    this.selected = []
  }
  saveEdit(){
    console.log(this.editForm.value)
    this.modalShowMessage("");
  }


  public modalShowMessage(messageType) {
    switch (messageType) {
      default: {
        this.modalTitle = "Oops!";
        this.modalBody = "Something went wrong on our end. Nothing terrible; however, you will need to enter the request information.";
        break;
      }
    }
    this.modal.open();
  }
}
