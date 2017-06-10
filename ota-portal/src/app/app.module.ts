import {RouterModule} from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AllRoutes } from "./all.routing";
import { AllComponent } from "./components/components.module";
import { AllServices } from "./services/services.module";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    ...AllComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(AllRoutes)
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [...AllServices],
  bootstrap: [AppComponent]
})
export class AppModule { }
