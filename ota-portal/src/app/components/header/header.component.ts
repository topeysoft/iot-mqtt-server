import {ElementRef, Component} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.scss']
})
export class HeaderComponent {
    /**
     *
     */
    constructor(public _host:ElementRef) {
    }
}
