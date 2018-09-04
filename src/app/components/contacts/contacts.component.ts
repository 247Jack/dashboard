import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ContactsService } from "../../services/contacts.service";
import { ModalComponent } from "dsg-ng2-bs4-modal/ng2-bs4-modal";
import * as _ from "lodash";
import { Console } from "@angular/core/src/console";
@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.css"]
})
export class ContactsComponent implements OnInit {

  private getContactsConn;
  items= [{ name: "archie" }, { name: "jake" }, { name: "richard" }];


  public contactsUsers = [];
  public contactsProviders = [];
  public contactsPropertyManagers = [];
  public currentContacts = [];
  public currentContact: any;
  public currentContactType = "";
  private currentPropertyManager: any;
  public newContactType = "";
  public dataLoaded = false;
  @ViewChild('modalmessage')
  modal: ModalComponent;
  public modalTitle = "";
  public modalBody = "";

  public editResidentData = {
    initials: "",
    firstName: "",
    lastName: "",
    portfolio: "",
    unit_abbr_name: "",
    service_threshold: "",
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
  public editVendorData = {
    initials: "",
    jobType: "",
    name: "",
    phone: "",
    ext: "",
    address: "",
    email: "",
    comments: ""
  }
  public editPMData = {
    initials: "",
    email: "",
    name: "",
    surname: "",
    phone: "",
    address: ""
  }

  public newResidentData = {
    firstName: "",
    lastName: "",
    portfolio: "",
    unit_abbr_name: "",
    service_threshold: "",
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
    phone: "",
    address: ""
  }


  constructor(
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private contacts: ContactsService
  ) {}

  ngOnInit() {
    this.spinnerService.show();
    this.currentPropertyManager = JSON.parse(localStorage.getItem('propertyManagerData'));
    this.getContactsConn = this.contacts.getContacts(this.currentPropertyManager['_id']).subscribe(data => {
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
      this.dataLoaded = true;
      this.spinnerService.hide();
      console.log(this.currentContacts)
    });
    this.activatedRoute.params.subscribe(params => {
      this.currentContactType = "";
      if(params.contactId)
      {
        document.getElementById("openModalButton").click();
        this.contacts.getSingleContact(this.currentPropertyManager._id, params.contactId)
        .subscribe(contactData => {
          console.log(contactData.contactResult)
          switch(contactData.contactType)
          {
            case 'tenant':
              this.editResidentData.initials = contactData.contactResult.firstName[0] + contactData.contactResult.lastName[0];
              this.editResidentData.firstName = contactData.contactResult.firstName;
              this.editResidentData.lastName = contactData.contactResult.lastName;
              this.editResidentData.portfolio = contactData.contactResult.portfolio;
              this.editResidentData.unit_abbr_name = contactData.contactResult.unit_abbr_name;
              this.editResidentData.service_threshold = contactData.contactResult.service_threshold;
              this.editResidentData.address = contactData.contactResult.building.address;
              this.editResidentData.address2 = contactData.contactResult.building.address2;
              this.editResidentData.city = contactData.contactResult.building.city;
              this.editResidentData.zip = contactData.contactResult.building.zip;
              this.editResidentData.phone = contactData.contactResult.contact.phone;
              this.editResidentData.workPhone = contactData.contactResult.contact.workPhone;
              this.editResidentData.email = contactData.contactResult.contact.email;
              this.editResidentData.alexa = contactData.contactResult.app.alexa;
              this.editResidentData.fb = contactData.contactResult.app.fb;
              this.editResidentData.sms = contactData.contactResult.app.sms;
              break;
            case 'vendor':
              this.editVendorData.initials = (contactData.contactResult.vendorData.name && contactData.contactResult.vendorData.name.split(" ").length > 1)
              ? `${contactData.contactResult.vendorData.name.split(" ")[0][0]}${
                contactData.contactResult.vendorData.name.split(" ")[1][0]
                }`
              : "",
              this.editVendorData.name = contactData.contactResult.vendorData.name;
              this.editVendorData.address = contactData.contactResult.vendorData.address;
              this.editVendorData.jobType = contactData.contactResult.vendorData.jobType;
              this.editVendorData.phone = contactData.contactResult.vendorData.phone;
              this.editVendorData.email = contactData.contactResult.vendorData.email;
              this.editVendorData.comments = contactData.contactResult.vendorData.comments;
              break;
            case 'property manager':
              this.editPMData.initials = contactData.contactResult.name[0] + contactData.contactResult.surname[0];
              this.editPMData.name = contactData.contactResult.name;
              this.editPMData.surname = contactData.contactResult.surname;
              this.editPMData.email = contactData.contactResult.email;
              this.editPMData.phone = contactData.contactResult.phone;
              this.editPMData.address = contactData.contactResult.address;

              break;
            default:
          }
          this.currentContactType = contactData.contactType;
          this.currentContact = contactData.contactResult;
        })
      }
    })
    this.activatedRoute.queryParams.subscribe(queryparams => {
      var waitForContacts = setInterval(() => {
        if(this.dataLoaded) {
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
          clearInterval(waitForContacts)
        }
      },100)
    })
  }

  ngOnDestroy(){
    if(this.getContactsConn) this.getContactsConn.unsubscribe();
  }

  saveNewContact(){
    if(this.newContactType)
    {
      var contactData;
      switch(this.newContactType)
      {
        case "user":
          contactData = this.newResidentData;
          break;
        case "vendor":
          contactData = this.newVendorData;
          break;
        case "property_manager":
          contactData = this.newPMData;
          break;
        default:
          contactData = {};
          break;
      }
      this.contacts.addContact(this.currentPropertyManager._id,contactData,this.newContactType).subscribe( data => {
        console.log(data)
      })
    }
  }

  cancelNewContact(){
    switch(this.newContactType)
    {
      case "user":
        for(var key in this.newResidentData)
        {
          this.newResidentData[key] = "";
        }
        break;
      case "vendor":
        for(var key in this.newVendorData)
        {
          this.newVendorData[key] = "";
        }
        break;
      case "property_manager":
        for(var key in this.newPMData)
        {
          this.newPMData[key] = "";
        }
        break;
    }
  }

  updateContact() {
    this.modalTitle = "Contact Updated"
    this.modalBody = "The contact information has been successfully stored."
    this.modal.open()
    // Empty fields
    // this.modalTitle = "Empty field"
    // this.modalBody = "Oops! It looks like we missing some important information in the contact card"
    // this.modal.open()
    // System error
    // this.modalTitle = "System Error"
    // this.modalBody = "Oops! It looks like something went wrong on our side. Please try again. If the issue remains, send us a note at support@247jack.com"
    // this.modal.open()
  };

  cancelEditContact(){
    switch(this.currentContactType)
    {
      case "tenant":
        for(var key in this.editResidentData)
        {
          this.editResidentData[key] = "";
        }
        break;
      case "vendor":
        for(var key in this.editVendorData)
        {
          this.editVendorData[key] = "";
        }
        break;
      case "property manager":
        for(var key in this.editPMData)
        {
          this.editPMData[key] = "";
        }
        break;
    }
  }

  afterHidden(e)
  {
    console.log(e)
  }

  onUploadError(e) {}

  onUploadSuccess(e) {}


}
