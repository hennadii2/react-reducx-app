import { createActions } from 'redux-actions';

//variables to store values from Purchase Grid
export const {
    purchaseView,
    purchaseViewHeaders,
    selectedPurchaseViewLine,
} = createActions({
    PURCHASE_VIEW: (data) => data,
    PURCHASE_VIEW_HEADERS: (data) =>data,
    SELECTED_PURCHASE_VIEW_LINE: (data) => data
})