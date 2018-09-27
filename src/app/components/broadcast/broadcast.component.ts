import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ContactsService } from "../../services/contacts.service";
import { BroadcastService } from "../../services/broadcast.service";
import { ModalComponent } from "dsg-ng2-bs4-modal";
@Component({
  selector: "app-broadcast",
  templateUrl: "./broadcast.component.html",
  styleUrls: ["./broadcast.component.css"]
})
export class BroadcastComponent implements OnInit {
  @ViewChild("modalBroadcast")
  modal: ModalComponent;
  getTenatsConn;
  getVendorsConn;

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  tenantsList = [];
  vendorsList = [];
  messageText = "";
  modalTitle = "";
  modalBody = "";
  currentTypeUser = "";
  currentPropertyManager: any;
  currentCompany = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private contacts: ContactsService,
    private broadcast: BroadcastService
  ) {}

  ngOnInit() {
    this.currentPropertyManager = JSON.parse(
      localStorage.getItem("propertyManagerData")
    );
    this.currentCompany = this.currentPropertyManager.company;
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Receivers",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true
    };
    this.activatedRoute.params.subscribe(params => {
      this.spinnerService.show();
      this.selectedItems = [];
      switch (params.contactType) {
        case "tenants":
          this.currentTypeUser = "tenant";
          this.getTenatsConn = this.contacts
            .getContacts(this.currentPropertyManager._id, "users")
            .subscribe(listResidents => {
              var tenantsList = [];
              for (var r in listResidents["usersResult"]) {
                tenantsList.push({
                  id: listResidents["usersResult"][r]._id,
                  itemName: `${listResidents["usersResult"][r]["firstName"]} ${
                    listResidents["usersResult"][r]["lastName"]
                  }`
                });
              }
              this.dropdownList = tenantsList;
              this.spinnerService.hide();
            });
          break;
        case "vendors":
          this.currentTypeUser = "vendor";
          this.getVendorsConn = this.contacts
            .getContacts(this.currentPropertyManager._id, "vendors")
            .subscribe(listResidents => {
              var vendorsList = [];
              for (var r in listResidents["vendorsResult"]) {
                vendorsList.push({
                  id: listResidents["vendorsResult"][r]._id,
                  itemName: `${
                    listResidents["vendorsResult"][r]["vendorData"]["name"]
                  }`
                });
              }
              this.dropdownList = vendorsList;
              this.spinnerService.hide();
            });
          break;
      }
    });
  }

  ngOnDestroy() {
    if (this.getVendorsConn) this.getVendorsConn.unsubscribe();
    if (this.getTenatsConn) this.getTenatsConn.unsubscribe();
  }

  onItemSelect(item: any) {}
  onSelectAll(items: any) {}

  cleanSelected() {
    this.selectedItems = [];
  }

  sendBroadcast() {
    this.spinnerService.show();
    if (this.selectedItems.length) {
      this.broadcast
        .makeBroadcast(
          this.currentPropertyManager._id,
          this.currentTypeUser,
          this.selectedItems,
          this.messageText
        )
        .subscribe(data => {
          this.spinnerService.hide();
          if (data.successful.length > 0 && data.errors.length == 0) {
            this.modalTitle = "Success";
            this.modalBody =
              "Success. The broadcast has been sent.";
            this.modal.open();
          } else {
            this.modalTitle = "Fail";
            this.modalBody =
              "Oops. Looks like something went wrong. Please refresh the page and try again ";
            this.modal.open();
          }
          this.messageText = "";
          this.selectedItems = [];
        });
    }
  }
}
