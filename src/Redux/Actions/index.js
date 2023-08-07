import * as appDefaults from './Defaults';
import * as receiptActions from './Receipts';
import * as purchaseActions from './Purchase';
import * as invoiceActions from './Invoice';
import * as whsDefaults from './WhsDefaults';
import * as purchaseViewActions from './PurchasesView';

export default {
    ...appDefaults,
    ...receiptActions,
    ...purchaseActions,
    ...invoiceActions,
    ...whsDefaults,
    ...purchaseViewActions
}