import { Component, OnInit, ViewChild } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { TicketsService } from "../../services/tickets.service";
import { IssuesService } from "../../services/issues.service";
import { ContactsService } from "../../services/contacts.service";
import { ModalComponent } from 'dsg-ng2-bs4-modal';

@Component({
  selector: 'app-wo',
  templateUrl: './wo.component.html',
  styleUrls: ['./wo.component.css']
})
export class WoComponent implements OnInit {
  @ViewChild('modalmessage')
  modal: ModalComponent;
  @ViewChild('modalDelete')
  modalDelete: ModalComponent;
  public tickets;
  public time;
  public date;
  public currentPropertyManager;
  public currentCompany;
  public currentTicket;
  public limitRows = 8;
  public recivedData;
  public issueToken: any;
  public issue: any;
  public selectedRow: any = [];
  public selectedVendor: any;
  public selected = [];
  public defaultStatus: string = 'Edit Status';
  public defaultVendor: string = 'Edit Vendor';
  public modalTitle = "";
  public modalBody = "";
  public temp = [];
  public originalData = [];
  public bitlyURL = "";
  public newCost = 0;
  public currentStatus = "";
  public setCompleted = false;
  public isCompleted = false;

  public vendorList = [];
  public vendorSelectedItems = [];
  public vendorSettings = {};
  public statusList = [];
  public statusSelectedItems = [];
  public statusSettings = {};
  public issuesList = [];
  public issuesSelectedItems = [];
  public issuesSettings = {};

  public newAddress: string;
  public newNote = "";
  public newNotes = []
  public editStatus = false
  public elementNote = {
    authorName: '',
    content: '',
    date: new Date()
  }
  public updateData = {};

  public editDataRequest
  public newprovidersDispatched: any;
  public deleteVendorStatus: boolean;
  public vendorsRemoved = [];
  public newVendorsBroadcasted = []

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService,
    private issues: IssuesService,
    private contacts: ContactsService
  ) {
    this.vendorSettings = {
      singleSelection: false,
      text: "Select",
      enableSearchFilter: true,
      badgeShowLimit: 1,
      position: "top"
    }
    this.statusSettings = {
      singleSelection: true,
      text: "Status",
      enableSearchFilter: false,
      badgeShowLimit: 1,
      position: "top"
    }
    this.issuesSettings = {
      singleSelection: true,
      text: "Issue",
      enableSearchFilter: true,
      badgeShowLimit: 1,
      position: "top"
    }
    this.statusList = [
      {
        id: "available",
        itemName: "Dispatched"
      },
      {
        id: "checked",
        itemName: "Assigned to vendor"
      },
      {
        id: "evaluating",
        itemName: "Requires attention"
      },
      {
        id: "approved",
        itemName: "Approved"
      },
      {
        id: "canceled",
        itemName: "Declined"
      },
      {
        id: "finished",
        itemName: "Completed"
      }
    ]
  }

  ngOnInit() {
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        sessionStorage.getItem('propertyManagerData')
      );
      this.currentCompany = sessionStorage.getItem('PMcompany')
      if (this.currentPropertyManager && this.currentCompany) {
        clearInterval(waitForPMData);
        this.loadTasks();
        this.ticket.update.subscribe(updating => {
          this.loadTasks();
        });
        this.contacts
          .getContacts(this.currentPropertyManager["_id"], this.currentCompany, "vendors")
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
            this.vendorList = vendorsList;
          });
        this.issues.getIssues(this.currentPropertyManager._id).subscribe(listIssues => {
          for (var i in listIssues)
          {
            this.issuesList.push({
              id: listIssues[i]._id,
              itemName: listIssues[i].issueToken
            });
          }
        })
      }
    }, 100);
  }
  private loadTasks() {
    this.spinnerService.show();
    this.ticket
      .getTickets(this.currentPropertyManager['_id'], this.currentCompany)
      .subscribe(data => {
        this.tickets = data;
        this.tickets.reverse();
        this.originalData = this.tickets;
        for (let i in this.tickets) {
          this.date = this.tickets[i].creationDate.split("T")[0];
          this.time = this.tickets[i].creationDate.split(/\.|\T/)[1];
        }
        this.spinnerService.hide();
      });
  }
  public checkPendientTask(event, task) {
    this.currentTicket = task;
  }
  public evaluateTask(response) {
    this.ticket
      .evaluateTaskThreshold(
        this.currentTicket._id,
        response,
        this.currentPropertyManager._id,
        this.currentCompany
      )
      .subscribe(data => {
        this.loadTasks()
      });
  }
  public getNameStatus(status){
    switch(status){
      case "available":
        return "Dispatched";
      case "finished":
        return "Completed";
      case "checked":
        return "Assigned to vendor";
      case "evaluating":
        return "Requires Attention";
      case "canceled":
        return "Canceled";
      case "approved":
        return "Approved";
    }
  }
  public onChange(deviceValue) {
    this.limitRows = deviceValue;
  }
  public onSelect({ selected }) {
    this.spinnerService.show();
    this.selectedRow = selected[0]
    if (this.selectedRow._id) {
      this.ticket.getEditTask(this.currentPropertyManager['_id'], this.currentCompany, this.selectedRow._id).subscribe(data => {
        this.editDataRequest = data
        let ids = this.editDataRequest.providersDispatched.map(v => (v.id).toString())
        let newVendorList = this.vendorList.filter(v => !(ids.includes((v.id).toString())))
        this.vendorList = newVendorList
        this.ticket.getBitlyLink(this.selectedRow._id, this.selectedVendor).subscribe(resultBitly => {
          this.bitlyURL = resultBitly.url;
        })
        this.newCost = this.editDataRequest.totalCost || 0
        this.newAddress = this.editDataRequest.tenantAddress.address.replace(/\s+/g, '+') + "+" + this.editDataRequest.tenantAddress.city
        this.currentStatus = this.getNameStatus(this.editDataRequest.requestStatus);
        this.isCompleted = (this.editDataRequest.requestStatus === "finished")
        /*
        this.issuesSelectedItems = []
        this.issuesSelectedItems.push({
          id: this.editDataRequest.issue._id,
          itemName: this.editDataRequest.issue.issueToken
        })
        this.statusSelectedItems = []
        if (this.editDataRequest.requestStatus === "available") {
          this.statusList = [
            {
              id: "available",
              itemName: "Dispatched"
            },
            {
              id: "finished",
              itemName: "Completed"
            }
          ]
        }
        if (this.editDataRequest.requestStatus === "checked") {
          this.statusList = [
            {
              id: "available",
              itemName: "Dispatched"
            },
            {
              id: "checked",
              itemName: "Assigned to vendor"
            },
            {
              id: "evaluating",
              itemName: "Requires Attention"
            },
            {
              id: "finished",
              itemName: "Completed"
            }
          ]
        }
        for (var i in this.statusList) {
          if (this.statusList[i].id == this.editDataRequest.requestStatus) {
            this.statusSelectedItems.push(this.statusList[i])
            break
          }
        }
        if (this.editDataRequest.requestStatus != "available" && this.editDataRequest.requestStatus != "checked") {
          this.statusSettings = {
            singleSelection: true,
            text: this.editDataRequest.requestStatus,
            enableSearchFilter: false,
            badgeShowLimit: 1,
            position: "top",
            disabled: true
          }
        }
        */
        for (var f in this.editDataRequest.notes) {
          this.editDataRequest.notes[f].authorName = this.editDataRequest.notes[f].authorName.split(/(\s+)/)[0]
        }
        this.spinnerService.hide();
        this.editStatus = true;
        if (this.editStatus === true) {
          document.getElementById("editRow").click();
        }
      })
    }
  }
  public cancelEdit() {
    this.editDataRequest = null
    this.editStatus = false
    this.newNote = "";
    this.vendorSelectedItems = []
    this.newNotes = [];
    this.statusList = [
      {
        id: "available",
        itemName: "Dispatched"
      },
      {
        id: "checked",
        itemName: "Assigned to vendor"
      },
      {
        id: "evaluating",
        itemName: "Requires attention"
      },
      {
        id: "approved",
        itemName: "Approved"
      },
      {
        id: "canceled",
        itemName: "Declined"
      },
      {
        id: "finished",
        itemName: "Completed"
      }
    ]
    document.getElementById("cancelEdit").click();
  }
  public deleteNewVendor(id) {
    let selectedVendor = this.vendorSelectedItems.filter(v => !(id.includes((v.id).toString())))
    this.vendorSelectedItems = selectedVendor
  }

  public deleteVendor(item) {
    let deleteVendors = this.editDataRequest.providersDispatched.filter(v => !(item.id.includes((v.id).toString())))
    this.editDataRequest.providersDispatched = deleteVendors
    this.vendorList.push({
      id: item.id,
      itemName: item.name
    })
    this.vendorsRemoved.push(item.id)
  }
  public addNote() {
    this.elementNote.authorName = this.currentPropertyManager.name.split(/(\s+)/)[0]
    this.elementNote.content = this.newNote
    this.elementNote.date = new Date()
    this.newNotes.push(this.elementNote)
  }
  public saveEdit() {
    for(var e in this.vendorSelectedItems){
      this.newVendorsBroadcasted.push(this.vendorSelectedItems[e].id)
    }
    this.spinnerService.show()
    let updateData = {
      vendorsRemoved: this.vendorsRemoved,
      newVendorsBroadcasted: this.newVendorsBroadcasted,
      //status: (this.statusSelectedItems.length) ? this.statusSelectedItems[0].id : "",
      newState: (!this.isCompleted && this.setCompleted)? "finished" : this.currentStatus,
      newCost: this.newCost,
      newIssue: (this.issuesSelectedItems.length) ? this.issuesSelectedItems[0].id : "",
      newNotes: [
        {
          authorId: this.currentPropertyManager._id,
          authorName: this.currentPropertyManager.name,
          content: this.newNote,
        }
      ]
    }
    if (this.vendorsRemoved.length < 1) {
      delete updateData.vendorsRemoved
    }
    if (this.vendorSelectedItems.length < 1) {
      delete updateData.newVendorsBroadcasted
    }
    if (this.newNote.length < 1) {
      delete updateData.newNotes
    }
    if (this.newCost == this.editDataRequest.totalCost) {
      delete updateData.newCost
    }
    if (this.currentStatus === updateData.newState) {
      delete updateData.newState
    }
    if(!updateData.newIssue){
      delete updateData.newIssue
    }
    this.updateData = updateData
    this.ticket.editTask(this.selectedRow._id, this.currentPropertyManager["_id"], this.currentCompany, this.updateData).subscribe(resultUpdate => {
      this.spinnerService.hide()
      this.modalShowMessage("saveTask");
      this.editStatus = false
      this.newNote = "";
      this.newNotes = [];
      this.vendorSelectedItems = []
      this.statusSelectedItems = []
      this.updateData = {}
      this.statusList = [
        {
          id: "available",
          itemName: "Dispatched"
        },
        {
          id: "checked",
          itemName: "Assigned to vendor"
        },
        {
          id: "evaluating",
          itemName: "Requires attention"
        },
        {
          id: "approved",
          itemName: "Approved"
        },
        {
          id: "canceled",
          itemName: "Declined"
        },
        {
          id: "finished",
          itemName: "Completed"
        }
      ]
      document.getElementById("cancelEdit").click();
      this.loadTasks();
    })
  }
  public openModalDelete() {
    this.modalTitle = "Cancel Request";
    this.modalBody = "Are you sure you want to cancel this service request? (This action cannot be undone)";
    this.modalDelete.open()
  }
  public removeRequest() {
     this.ticket.deleteField(this.selectedRow._id, this.currentPropertyManager["_id"], this.currentCompany).subscribe(resultUpdate => {
       this.loadTasks();
       this.modalDelete.close()
       this.modalShowMessage("DeleteTask");
       document.getElementById("cancelEdit").click();
     })
  }
  public modalShowMessage(messageType) {
    switch (messageType) {
      case "saveTask":
        this.modalTitle = "Request updated!";
        this.modalBody = "Your select request has been updated. However, you need to notify the vendors about the change, if needed.";
        break;
      case "DeleteTask":
        this.modalTitle = "Request canceled!";
        this.modalBody = "This request has been successfully canceled.";
        break;
      default: {
        this.modalTitle = 'Oops!';
        this.modalBody = 'Something went wrong on our end. Nothing terrible; however, you will need to enter the request information.';
        break;
      }
    }
    this.modal.open();
  }
  // filter data and update rows
  public updateFilter(event) {
    this.spinnerService.show();
    this.tickets = this.originalData;
    const search = event.target.value.toLowerCase();
    if (search.length > 0) {
      const filteredData = this.tickets.filter(e =>
        e.ticketDescription.toLowerCase().includes(search)
      ).sort((a, b) =>
        a.ticketDescription.toLowerCase().includes(search) && !b.ticketDescription.toLowerCase().includes(search) ?
          -1 : b.ticketDescription.toLowerCase().includes(search) && !a.ticketDescription.toLowerCase().includes(search) ? 1 : 0);
      this.tickets = filteredData;
    }
    this.spinnerService.hide();
  }

}
