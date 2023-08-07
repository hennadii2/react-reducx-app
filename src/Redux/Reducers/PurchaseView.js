import { handleActions, } from 'redux-actions';

//import from custom functions
import Actions from "../Actions"

const initialState = {
    purchaseView: null,
    purchaseViewHeaders: null,
    selectedPurchaseViewLine: null,
}

const reducer = handleActions({
    [Actions.purchaseView]: (state, { payload: data }) => {
        return { ...state, purchaseView: data }
    },
    [Actions.purchaseViewHeaders]: (state, { payload: data }) => {
        return { ...state, purchaseViewHeaders: data }
    },
    [Actions.selectedPurchaseViewLine]: (state, { payload: data }) => {
        return { ...state, selectedPurchaseViewLine: data }
    }
}, initialState)

export default reducer