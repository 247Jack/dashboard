export interface Tenant {
    initials: string;
    firstName: string;
    lastName: string;
    portfolio: string;
    unit_abbr_name: string;
    service_threshold: string;
    address: string;
    address2: string;
    city: string;
    zip: string;
    endDate: string;
    phone: string;
    homePhone: string;
    workPhone: string;
    email: string;
    alexa: string;
    ghome: string;
    fb: string;
    sms: string;
}

export interface Vendor {
    initials: string;
    jobType: string;
    name: string;
    phone: string;
    ext: string;
    address: string;
    email: string;
    comments: string;
}

export interface PropertyManager {
    initials: string;
    email: string;
    name: string;
    surname: string;
    phone: string;
    address: string;
}
