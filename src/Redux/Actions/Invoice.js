import { createActions } from 'redux-actions'

//variables to store values from Invoice Grid
export const {
    reloadInvoice,
    invoice,
    invoiceHeaders,
    invoiceConfirm,
    updateInvoice,
    selectedInvoiceLine,
    invoiceRowIndex,
    invoiceClmnIndex,
    lotNo
} = createActions({
    RELOAD_INVOICE: (data)=> data,
    INVOICE: (data) => data,
    INVOICE_HEADERS: (data) => data,
    INVOICE_CONFIRM: (data) => data,
    UPDATE_INVOICE: (data) => data,
    SELECTED_INVOICE_LINE: (data) => data,
    INVOICE_ROW_INDEX: (data) => data,
    INVOICE_CLMN_INDEX: (data) => data,
    LOT_NO: (data) => data
})