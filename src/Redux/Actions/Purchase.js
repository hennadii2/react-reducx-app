import { createActions } from 'redux-actions';

//variables to store values from Purchase Grid
export const {
    updatePurchase,
    purchase,
    purchaseHeaders,
    selectedPurchaseLine,
    selectedRowIndex,
    selectedClmnIndex
} = createActions({
    UPDATE_PURCHASE: (data) => data,
    PURCHASE: (data) => data,
    PURCHASE_HEADERS: (data) =>data,
    SELECTED_PURCHASE_LINE: (data) => data,
    SELECTED_ROW_INDEX: (data) => data,
    SELECTED_CLMN_INDEX: (data) => data
})