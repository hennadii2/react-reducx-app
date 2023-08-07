import { handleActions, } from 'redux-actions';

//import from custom functions
import Actions from "../Actions"

const initialState = {
    reloadInvoice: null,
    invoice: null,
    invoiceHeaders: null,
    invoiceConfirm: null,
    updateInvoice: null,
    selectedInvoiceLine: null,
    invoiceRowIndex: null,
    invoiceClmnIndex: null,
    lotNo: null
}

const reducer = handleActions({
    [Actions.reloadInvoice]: (state, { payload: data }) => {
        return { ...state, reloadInvoice: data }
    },
    [Actions.invoice]: (state, { payload: data }) => {
        return { ...state, invoice: data }
    },
    [Actions.invoiceHeaders]: (state, { payload: data }) => {
        return { ...state, invoiceHeaders: data }
    },
    [Actions.invoiceConfirm]: (state, { payload: data }) => {
        return { ...state, invoiceConfirm: data }
    },
    [Actions.updateInvoice]: (state, { payload: data }) => {
        return { ...state, updateInvoice: data }
    },
    [Actions.selectedInvoiceLine]: (state, { payload: data }) => {
        return { ...state, selectedInvoiceLine: data }
    },
    [Actions.invoiceRowIndex]: (state, { payload: data }) => {
        return { ...state, invoiceRowIndex: data }
    },
    [Actions.invoiceClmnIndex]: (state, { payload: data }) => {
        return { ...state, invoiceClmnIndex: data }
    },
    [Actions.lotNo]: (state, { payload: data }) => {
        return { ...state, lotNo: data }
    }
}, initialState)

export default reducer