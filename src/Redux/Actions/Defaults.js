import { createActions } from 'redux-actions'

//variables to store values from App Defaults
export const {
    activeTab,
    disableInvoiceConfirm,
    enableInvoiceUnconfirm,
    defaultLot,
    defaultWtCase,
    defaultLotValue,
    defaultOther,
    tempDefaultLot,
    tempDefaultWtCase,
    tempDefaultLotValue,
    tempDefaultOther,
    defaultRelease,
    defaultTally,
    defaultTruck,
    reportPath
} = createActions({
    ACTIVE_TAB: (data) => data,
    DISABLE_INVOICE_CONFIRM: (data) => data,
    ENABLE_INVOICE_UNCONFIRM: (data) => data,
    DEFAULT_LOT: (data) => data,
    DEFAULT_WT_CASE: (data) => data,
    DEFAULT_LOT_VALUE: (data) => data,
    DEFAULT_OTHER: (data) => data,
    TEMP_DEFAULT_LOT: (data) => data,
    TEMP_DEFAULT_WT_CASE: (data) => data,
    TEMP_DEFAULT_LOT_VALUE: (data) => data,
    TEMP_DEFAULT_OTHER: (data) => data,
    DEFAULT_RELEASE: (data) => data,
    DEFAULT_TALLY: (data) => data,
    DEFAULT_TRUCK: (data) => data,
    REPORT_PATH: (data) => data,
})