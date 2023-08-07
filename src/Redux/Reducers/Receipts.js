import { handleActions } from 'redux-actions'

//import from custom functions
import Actions from "../Actions"

const initialState = {
    updateReceipts: false,
    receipts: null,
    receiptHeaders: null,
    selectedReceipt: null,
    fromDate: null,
    toDate: null
}

const reducer = handleActions({
    [Actions.updateReceipts]: (state, { payload: data }) => {
        return { ...state, updateReceipts: data }
    },
    [Actions.receipts]: (state, { payload: data }) => {
        return { ...state, receipts: data }
    },
    [Actions.receiptHeaders]: (state, { payload: data }) => {
        return { ...state, receiptHeaders: data }
    },
    [Actions.selectedReceipt]: (state, { payload: data }) => {
        return { ...state, selectedReceipt: data }
    },
    [Actions.fromDate]: (state, { payload: data }) => {
        return { ...state, fromDate: data }
    },
    [Actions.toDate]: (state, { payload: data }) => {
        return { ...state, toDate: data }
    }
}, initialState)

export default reducer