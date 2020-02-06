import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { CustomerAccount, AlphaSearchRequest } from 'src/app/models/customerAccount';
import { DynamicColumn } from 'src/app/models/dynamic-column';
import { OrderService } from 'src/app/services/order.service';
import { ActivatedRoute, Params } from '@angular/router';
import { TopMenuService } from 'src/app/services/top-menu.service';
import { ValidationMessage, ValidationMessageType } from 'src/app/models/core';
import { DataType } from 'src/app/models/core';

@Component({
  selector: 'app-customer-accounts',
  templateUrl: './customer-accounts.component.html',
  styleUrls: ['./customer-accounts.component.scss']
})
export class CustomerAccountsComponent {

  public dataSource = new MatTableDataSource<CustomerAccount>();

  public messageInfo: ValidationMessage = {};
  public validationMessageType = ValidationMessageType;

  public columns: DynamicColumn[] = [];
  public searchRequest: AlphaSearchRequest;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private topMenu: TopMenuService
  ) {
    this.route.queryParams.subscribe(params => {
      this.searchRequest = {...params} as AlphaSearchRequest;

      if (Object.keys(this.searchRequest).length) {
        
      }
	  console.log(test);
      this.initializeDynamicColumns(params);
      this.topMenu.setHeader(undefined, undefined);
    });
  }

  public initializeDynamicColumns(params: Params) {
    this.columns = [
      this.createDynamicCustomerAccountColumn(params),
      new DynamicColumn('Store Name', 'storeName'),
      new DynamicColumn('Number', 'storeNumber'),
      new DynamicColumn('Address', 'addressLines', { dataType: DataType.array }),
      new DynamicColumn('State', 'stateCode'),
      new DynamicColumn('Story Type', 'storeType'),
    ];
  }

  public createDynamicCustomerAccountColumn(params: Params): DynamicColumn {
    if (this.isAdditionalParametersSearch) {
      params = {
        invoice: this.searchRequest.invoice,
        purchaseOrder: this.searchRequest.purchaseOrder,
        isbn: this.searchRequest.isbn,
        isDelivery: true};
      return new DynamicColumn('Customer Account', 'accountKey', {redirectUrl : '/alphaSearch/statementAccounts', queryParams: params });
    }
    return new DynamicColumn('Customer Account', 'accountKey', {useInnerUrl: true});
  }

  public getCustomerAccounts(alphaRequest: AlphaSearchRequest) {
    this.messageInfo = {};
    this.orderService.getCustomerAccounts(alphaRequest).subscribe(res => {
      const a = res.find(a => a);
      if (res.length) {
        this.messageInfo = new ValidationMessage(`${this.dataSource.data.length} results have been found.`, true);
      } else {
        this.messageInfo =  new ValidationMessage('0 results have been found');
      }
      this.assignRedirectUrls(res);
      this.dataSource.data = res;
	  console.log('1')
    });
  }

  private isAdditionalParametersSearch() {
    return this.searchRequest.isbn || this.searchRequest.invoice || this.searchRequest.purchaseOrder;
  }

  private assignRedirectUrls(items: CustomerAccount[]) {
    items.forEach(item => {
      if (item.storeType === 'Statement') {
        item.innerUrl = '/alphaSearch/statementAccounts';
      } else {
        item.innerUrl = this.isAdditionalParametersSearch ? '/alphaSearch/DeliveryDetail' : '/alphaSearch/customerOrders';
      }
    });
  }
}
