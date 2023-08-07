import { handleActions, } from 'redux-actions';

//import from custom functions
import Actions from "../Actions"

const initialState = {
    updatePurchase: null,
    purchase: [],
    purchaseHeaders: null,
    selectedPurchaseLine: null,
    selectedRowIndex: null,
    selectedClmnIndex: null
}

const reducer = handleActions({
    [Actions.updatePurchase]: (state, { payload: data }) => {
        return { ...state, updatePurchase: data }
    },
    [Actions.purchase]: (state, { payload: data }) => {
        return { ...state, purchase: data }
    },
    [Actions.purchaseHeaders]: (state, { payload: data }) => {
        return { ...state, purchaseHeaders: data }
    },
    [Actions.selectedPurchaseLine]: (state, { payload: data }) => {
        return { ...state, selectedPurchaseLine: data }
    },
    [Actions.selectedRowIndex]: (state, { payload: data }) => {
        return { ...state, selectedRowIndex: data }
    },
    [Actions.selectedClmnIndex]: (state, { payload: data }) => {
        return { ...state, selectedClmnIndex: data }
    }
}, initialState)

export default reducer