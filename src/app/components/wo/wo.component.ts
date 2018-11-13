import { Component, OnInit, ViewChild } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { TicketsService } from "../../services/tickets.service";
import { IssuesService } from "../../services/issues.service";
import { ContactsService } from "../../services/contacts.service";
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  public editForm: FormGroup;
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
  public elementNote = {
    authorName: '',
    content: '',
    date: new Date()
  }
  updateData = {};
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService,
    private issues: IssuesService,
    private contacts: ContactsService
  ) {
    this.editForm = new FormGroup({
      status: new FormControl(null),
      vendor: new FormControl(null),
      cost: new FormControl(null),
      id: new FormControl(null)
    });
    this.editForm.controls['status'].setValue(this.defaultStatus, { onlySelf: true })
    this.editForm.controls['vendor'].setValue(this.defaultVendor, { onlySelf: true })
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
        id: 0,
        itemName: "Available"
      },
      {
        id: 1,
        itemName: "Checked"
      },
      {
        id: 2,
        itemName: "Evaluating"
      },
      {
        id: 3,
        itemName: "Approved"
      },
      {
        id: 4,
        itemName: "Denied"
      },
      {
        id: 5,
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
        this.spinnerService.hide();
        this.tickets = data;
        this.tickets.reverse();
        this.originalData = this.tickets;
        for (let i in this.tickets) {
          this.date = this.tickets[i].creationDate.split("T")[0];
          this.time = this.tickets[i].creationDate.split(/\.|\T/)[1];
        }
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
    this.selectedRow = selected[0]
    console.log(this.selectedRow)
    if (this.selectedRow.assignedVendors.length > 0) {
      this.selectedVendor = this.selectedRow.assignedVendors[0]._id
      this.vendorSelectedItems = []
      this.vendorSelectedItems.push({
        id: this.selectedRow.assignedVendors[0]._id,
        itemName: this.selectedRow.assignedVendors[0].vendorData.name
      })
      this.ticket.getBitlyLink(this.selectedRow._id, this.selectedVendor).subscribe(resultBitly => {
        this.bitlyURL = resultBitly.url;
        document.getElementById("editRow").click();
      })
    }
    else {
      document.getElementById("editRow").click();
    }
    this.newCost = this.selectedRow.issueData.repairCost || 0
    this.statusSelectedItems = []
    for (var i in this.statusList) {
      if (this.statusList[i].itemName === this.selectedRow.status) {
        this.statusSelectedItems.push(this.statusList[i])
        break
      }
    }
    for (var e in this.selectedRow.residents) {
      this.newAddress = this.selectedRow.residents[e].building.address.replace(/\s+/g, '+') + "+" + this.selectedRow.residents[e].building.city
    }
    for (var f in this.selectedRow.notes) {
      this.selectedRow.notes[f].authorName = this.selectedRow.notes[f].authorName.split(/(\s+)/)[0]
    }
    if (selected[0]._id) {
      this.editForm.controls['id'].setValue(selected[0]._id, { onlySelf: true })
    }

  }

  onVendorSelect(event) {
    this.ticket.getBitlyLink(this.selectedRow._id, event.id).subscribe(resultBitly => {
      this.bitlyURL = resultBitly.url
      //document.getElementById("editRow").click();
    })
  }

  cancelEdit() {
    this.selected = []
  }
  saveEdit() {
    if (this.newNote.length > 0) {
      this.updateData = {
        vendor_id: this.vendorSelectedItems,
        status: (this.statusSelectedItems.length) ? this.statusSelectedItems[0].itemName : "",
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
        status: (this.statusSelectedItems.length) ? this.statusSelectedItems[0].itemName : "",
        repair_cost: this.newCost
      }
    }

    console.log(this.updateData)
    // this.ticket.updateSimpleRequest(this.selectedRow._id, this.currentCompany, this.updateData).subscribe(resultUpdate => {
    //   this.selected = []
    //   this.modalShowMessage("saveTask");
    //   this.loadTasks();
    // })
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
