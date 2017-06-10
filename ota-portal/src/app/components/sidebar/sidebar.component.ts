import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  menuItems;
  constructor() {
    this.menuItems=[
      {text:'Manifest Editor', uri:'/manifest'},
      {text:'Active Firmwares', uri:'/firmwares'},
      {text:'Connected Devices', uri:'/devices'},
      {text:'Retired Firmwares', uri:'/firmwares/retired'}
    ]
   }

  ngOnInit() {
  }

}