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

  public vendorList = [];
  public vendorSelectedItems = [];
  public vendorSettings = {};
  public statusList = [];
  public statusSelectedItems = [];
  public statusSettings = {};

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

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService,
    private issues: IssuesService,
    private contacts: ContactsService
  ) {
    this.vendorSettings = {
      singleSelection: false,
      text: "+ Dispatch to more vendors…",
      enableSearchFilter: true,
      badgeShowLimit: 1
    }
    this.statusSettings = {
      singleSelection: true,
      text: "Edit status",
      enableSearchFilter: false,
      badgeShowLimit: 1,
      position: "top"
    }
    this.statusList = [
      {
        id: "available",
        itemName: "Dispatch"
      },
      {
        id: "checked",
        itemName: "Checked"
      },
      {
        id: "evaluating",
        itemName: "Requires Attention"
      },
      {
        id: "approved",
        itemName: "Approved"
      },
      {
        id: "canceled",
        itemName: "Denied"
      },
      {
        id: "finished",
        itemName: "Finished"
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
      }
    }, 100);
  }

  private loadTasks() {
    this.spinnerService.show();
    this.ticket
      .getTickets(this.currentPropertyManager['_id'], this.currentCompany)
      .subscribe(data => {
        console.log(data);
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
        this.currentPropertyManager._id
      )
      .subscribe(data => {
        this.loadTasks();
      });
  }

  onChange(deviceValue) {
    this.limitRows = deviceValue;
  }

  onSelect({ selected }) {
    this.spinnerService.show();
    this.selectedRow = selected[0]
    if (this.selectedRow._id) {
      this.ticket.getEditTask(this.currentPropertyManager['_id'], this.currentCompany, this.selectedRow._id).subscribe(data => {
        console.log(data);
        this.editDataRequest = data
        if (this.editDataRequest.providersDispatched.length > 0) {
          for (var e in this.editDataRequest.providersDispatched) {
            this.newprovidersDispatched = this.editDataRequest.providersDispatched
            if (this.editDataRequest.providersDispatched[e].requestAccepted == true) {
              this.selectedVendor = this.editDataRequest.providersDispatched[e]._id
              this.vendorSelectedItems.push({
                id: this.editDataRequest.providersDispatched[e]._id,
                itemName: this.editDataRequest.providersDispatched[e].name
              })
            }
          }
          this.ticket.getBitlyLink(this.selectedRow._id, this.selectedVendor).subscribe(resultBitly => {
            this.bitlyURL = resultBitly.url;
          })
        }
        this.newCost = this.editDataRequest.totalCost || 0
        this.newAddress = this.editDataRequest.tenantAddress.address.replace(/\s+/g, '+') + "+" + this.editDataRequest.tenantAddress.city
        this.statusSelectedItems = []
        if (this.editDataRequest.requestStatus === "available") {
          this.statusList = [
            {
              id: "available",
              itemName: "Dispatch"
            },
            {
              id: "finished",
              itemName: "Closed"
            }
          ]
        }
        if (this.editDataRequest.requestStatus === "checked") {
          this.statusList = [
            {
              id: "available",
              itemName: "Dispatch"
            },
            {
              id: "checked",
              itemName: "Checked"
            },
            {
              id: "evaluating",
              itemName: "Requires Attention"
            },
            {
              id: "finished",
              itemName: "Finished"
            }
          ]
        }
        if (this.editDataRequest.requestStatus != "available" && this.editDataRequest.requestStatus != "checked") {
          this.statusSettings = {
            singleSelection: false,
            text: "+ Dispatch to more vendors…",
            enableSearchFilter: true,
            badgeShowLimit: 1,
            disabled: true
          }
        }
        for (var i in this.statusList) {
          if (this.statusList[i].id == this.editDataRequest.requestStatus) {
            this.statusSelectedItems.push(this.statusList[i])
            break
          }
        }
        for (var f in this.editDataRequest.notes) {
          this.editDataRequest.notes[f].authorName = this.editDataRequest.notes[f].authorName.split(/(\s+)/)[0]
        }
        this.spinnerService.hide();
        this.editStatus = true;
        if(this.editStatus === true){
          document.getElementById("editRow").click();
        }
      })
    }
  }

  onVendorSelect(event) {
    this.ticket.getBitlyLink(this.selectedRow._id, event.id).subscribe(resultBitly => {
      this.bitlyURL = resultBitly.url
      //document.getElementById("editRow").click();
    })
  }

  cancelEdit() {
    this.editDataRequest = null
    this.editStatus = false
  }
  saveEdit() {
    this.spinnerService.show()
    if (this.newCost == this.editDataRequest.totalCost) {
      this.newCost = null
    }
    if (this.newNote.length > 0) {
      this.updateData = {
        vendor_id: this.vendorSelectedItems,
        status: (this.statusSelectedItems.length) ? this.statusSelectedItems[0].id : "",
        repair_cost: this.newCost,
        newNote: {
          authorId: this.currentPropertyManager._id,
          authorName: this.currentPropertyManager.name,
          content: this.newNote,
          date: new Date(),
        }
      }
    } else {
      this.updateData = {
        vendor_id: this.vendorSelectedItems,
        status: (this.statusSelectedItems.length) ? this.statusSelectedItems[0].id : "",
        repair_cost: this.newCost
      }
    }
    console.log(this.updateData)
    this.spinnerService.hide()
    this.modalShowMessage("saveTask");
    this.editStatus = false
    document.getElementById("cancelEdit").click();
    // this.ticket.editTask(this.selectedRow._id, this.currentCompany, this.updateData).subscribe(resultUpdate => {
    //   this.modalShowMessage("saveTask");
    //   this.loadTasks();
    //   this.spinnerService.hide()
    // })
  }
  deleteVendor(vendor_id) {
    for (var i in this.newprovidersDispatched) {
      if (vendor_id == this.newprovidersDispatched[i]._id) {
        var index = this.newprovidersDispatched.indexOf(vendor_id);
        if (index) {
          this.newprovidersDispatched.splice(index, 1);
        }
      }
    }
    for (var e in this.vendorSelectedItems) {
      if (vendor_id == this.vendorSelectedItems[e]._id) {
        var sindex = this.vendorSelectedItems.indexOf(vendor_id);
        if (sindex) {
          this.vendorSelectedItems.splice(sindex, 1);
        }
      }
    }
  }
  addNote() {
    this.elementNote.authorName = this.currentPropertyManager.name.split(/(\s+)/)[0]
    this.elementNote.content = this.newNote
    this.elementNote.date = new Date()
    this.newNotes.push(this.elementNote)
  }
  openModalDelete() {
    this.modalTitle = "Delete Request";
    this.modalBody = "Are you sure you want to delete this service request?";
    this.modalDelete.open()
  }
  removeRequest() {
    // this.ticket.deleteField(this.selectedRow._id, this.currentCompany).subscribe(resultUpdate => {
    //   this.modalShowMessage("DeleteTask");
    //   this.loadTasks();
    // })
    this.modalDelete.close()
    this.modalShowMessage("DeleteTask");
    document.getElementById("cancelEdit").click();
  }
  public modalShowMessage(messageType) {
    switch (messageType) {
      case "saveTask":
        this.modalTitle = "Request updated!";
        this.modalBody = "Your select request has been updated. However, you need to notify the vendors about the change, if needed.";
        break;
      case "DeleteTask":
        this.modalTitle = "Request Deleted!";
        this.modalBody = "This request has been successfully deleted.";
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
  updateFilter(event) {
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
