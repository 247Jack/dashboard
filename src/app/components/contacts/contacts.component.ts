import { Component, OnInit } from "@angular/core";
import { ContactsService } from "../../services/contacts.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";

@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.css"]
})
export class ContactsComponent implements OnInit {

  private getContactsConn;

  public contactsUsers = [];
  public contactsProviders = [];
  public contactsPropertyManagers = [];
  public currentContacts = [];
  public currentContact: any;
  private currentPropertyManager: any;
  public newContactType = "";
  public editContactType = "edit_user";
  public editContact = [];
  public newResidentData = {
    firstName: "",
    lastName: "",
    portfolio: "",
    unit_abbr_name: "",
    service_threshold: 0,
    address: "",
    address2: "",
    city: "",
    zip: "",
    endDate: "",
    phone: "",
    homePhone: "",
    workPhone: "",
    email: "",
    alexa: "",
    fb: "",
    sms: ""
  }
  public newVendorData = {
    jobType: "",
    name: "",
    phone: "",
    ext: "",
    address: "",
    email: "",
    comments: ""
  }
  public newPMData = {
    email: "",
    name: "",
    surname: "",
    homePhome: "",
    mobile: "",
    rank: ""
  }


  constructor(
    private activatedRoute: ActivatedRoute,
    private userlist: ContactsService
  ) {}

  ngOnInit() {
    this.currentPropertyManager = JSON.parse(localStorage.getItem('propertyManagerData'));
    this.getContactsConn = this.userlist.getContacts(this.currentPropertyManager['_id']).subscribe(data => {
      for (let i in data.usersResult) {
        let userData = {
          id: data.usersResult[i]._id,
          contact_type: "user",
          color: "red",
          name: `${data.usersResult[i].firstName} ${
            data.usersResult[i].lastName
          }`,
          initials: `${data.usersResult[i].firstName[0]}${
            data.usersResult[i].lastName[0]
          }`,
          email: data.usersResult[i].contact.email,
          mobile: data.usersResult[i].contact.email,
          originalData: data.usersResult[i]
        };
        this.contactsUsers.push(userData);
      }
      for (let i in data.vendorsResult) {
        let userData = {
          id: data.vendorsResult[i]._id,
          contact_type: "provider",
          color: "green",
          name: data.vendorsResult[i].vendorData.name,
          initials:
            (data.vendorsResult[i].vendorData.name && data.vendorsResult[i].vendorData.name.split(" ").length > 1)
              ? `${data.vendorsResult[i].vendorData.name.split(" ")[0][0]}${
                  data.vendorsResult[i].vendorData.name.split(" ")[1][0]
                }`
              : "",
          email: data.vendorsResult[i].vendorData.email,
          mobile: data.vendorsResult[i].vendorData.mobile,
          originalData: data.usersResult[i]
        };
        this.contactsProviders.push(userData);
      }
      for (let i in data.pManagersResult) {
        let userData = {
          id: data.pManagersResult[i]._id,
          contact_type: "property manager",
          color: "blue",
          name: `${data.pManagersResult[i].name} ${
            data.pManagersResult[i].surname
          }`,
          initials: `${data.pManagersResult[i].name[0]}${
            data.pManagersResult[i].surname[0]
          }`,
          email: data.pManagersResult[i].email,
          mobile: data.pManagersResult[i].contact.mobile,
          originalData: data.usersResult[i]
        };
        this.contactsPropertyManagers.push(userData);
      }
      this.currentContacts = [];
      this.currentContacts = this.currentContacts.concat(this.contactsUsers);
      this.currentContacts = this.currentContacts.concat(
        this.contactsProviders
      );
      this.currentContacts = this.currentContacts.concat(
        this.contactsPropertyManagers
      );
    });
    this.activatedRoute.params.subscribe(params => {
      
      if(params.contactId)
      {
        this.currentContact = _.find(this.currentContacts, {id: params.contactId});
        if(this.currentContact)
        {
          console.log(this.currentContact)
          switch(this.currentContact.contact_type)
          {
            case 'user':

              break;
            case 'provider':

              break;
            case 'property manager':

              break;
            default:

          }
        }
      }
    })
    this.activatedRoute.queryParams.subscribe(queryparams => {
      switch (queryparams["typecontact"]) {
        case "users":
          this.currentContacts = [];
          this.currentContacts = this.contactsUsers;
          break;
        case "providers":
          this.currentContacts = [];
          this.currentContacts = this.contactsProviders;
          break;
        case "managers":
          this.currentContacts = [];
          this.currentContacts = this.contactsPropertyManagers;
          break;
        default:
          this.currentContacts = [];
          this.currentContacts = this.currentContacts.concat(
            this.contactsUsers
          );
          this.currentContacts = this.currentContacts.concat(
            this.contactsProviders
          );
          this.currentContacts = this.currentContacts.concat(
            this.contactsPropertyManagers
          );
          break;
      }
    })
  }

  ngOnDestroy(){
    if(this.getContactsConn) this.getContactsConn.unsubscribe();
  }

  saveNewContact(){
    switch(this.newContactType)
    {
      case "user":
        console.log(this.newResidentData)
        break;
      case "vendor":
        console.log(this.newVendorData)
        break;
      case "property_manager":
        console.log(this.newPMData)
        break;
    }
  }

  UpdateContact() {
    console.log(this.editContact)
    this.editContact = []
    console.log(this.editContact)
  };

  onUploadError(e) {}

  onUploadSuccess(e) {}
}
