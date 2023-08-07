import { createActions } from 'redux-actions'

//variables to store values from Receipts Grid
export const {
    updateReceipts,
    receipts,
    receiptHeaders,
    selectedReceipt,
    fromDate,
    toDate
} = createActions({
    UPDATE_RECEIPTS: (data) => data,
    RECEIPTS: (data) => data,
    RECEIPT_HEADERS: (data) => data,
    SELECTED_RECEIPT: (data) => data,
    FROM_Date: (data) => data,
    TO_DATE: (data) => data,
})