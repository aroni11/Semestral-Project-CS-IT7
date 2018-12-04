import { BrowserModule } from '@angular/platform-browser';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatBadgeModule, MatFormFieldModule, MatInputModule
} from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { PathsService } from './paths.service';
import { HttpClientModule } from '@angular/common/http';
import { WebsocketService } from './websocket-service.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LeafletModule.forRoot(),
    BrowserAnimationsModule,
    MatToolbarModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    PathsService,
    WebsocketService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
