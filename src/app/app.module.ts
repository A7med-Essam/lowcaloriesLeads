import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PaginatorModule } from 'primeng/paginator';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipsModule } from 'primeng/chips';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Error404Component } from './components/error404/error404.component';
import { AuthInterceptor } from './core/http.interceptor';
import { HomeComponent } from './components/home/home.component';

const APP_PRIMENG_MODULE = [
  SharedModule,
  TableModule,
  DialogModule,
  BreadcrumbModule,
  ButtonModule,
  RippleModule,
  DropdownModule,
  PaginatorModule,
  StepsModule,
  CheckboxModule,
  InputTextModule,
  RadioButtonModule,
  CalendarModule,
  ConfirmDialogModule,
  FileUploadModule,
  ListboxModule,
  MultiSelectModule,
  ChipsModule,
  AccordionModule,
  ToastModule,
];

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    FooterComponent,
    NavbarComponent,
    LoginComponent,
    Error404Component,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    APP_PRIMENG_MODULE,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    MessageService,
    ConfirmationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
