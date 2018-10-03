import { Injectable } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

@Injectable()
export class AutopopulateService {

    constructor() { }

    @Output() change: EventEmitter<any> = new EventEmitter();

    public sendService ( serviceData ){
        this.change.emit(serviceData);
    }

}