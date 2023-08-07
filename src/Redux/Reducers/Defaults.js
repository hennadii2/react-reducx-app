import { handleActions, } from 'redux-actions';

//import from custom functions
import Actions from "../Actions"

const initialState = {
    activeTab: null,
    disableInvoiceConfirm: null,
    enableInvoiceUnconfirm: null,
    defaultLot: '',
    defaultWtCase: '',
    defaultLotValue: '',
    defaultOther: '',
    tempDefaultLot: '',
    tempDefaultWtCase: '',
    tempDefaultLotValue: '',
    tempDefaultOther: '',
    defaultRelease: '',
    defaultTally: '',
    defaultTruck: ''
}

const reducer = handleActions({
    [Actions.activeTab]: (state, { payload: data }) => {
        return { ...state, activeTab: data }
    },
    [Actions.disableInvoiceConfirm]: (state, { payload: data }) => {
        return { ...state, disableInvoiceConfirm: data }
    },
    [Actions.enableInvoiceUnconfirm]: (state, { payload: data }) => {
        return { ...state, enableInvoiceUnconfirm: data }
    },
    [Actions.defaultLot]: (state, { payload: data }) => {
        return { ...state, defaultLot: data }
    },
    [Actions.defaultWtCase]: (state, { payload: data }) => {
        return { ...state, defaultWtCase: data }
    },
    [Actions.defaultLotValue]: (state, { payload: data }) => {
        return { ...state, defaultLotValue: data }
    },
    [Actions.defaultOther]: (state, { payload: data }) => {
        return { ...state, defaultOther: data }
    },
    [Actions.tempDefaultLot]: (state, { payload: data }) => {
        return { ...state, tempDefaultLot: data }
    },
    [Actions.tempDefaultWtCase]: (state, { payload: data }) => {
        return { ...state, tempDefaultWtCase: data }
    },
    [Actions.tempDefaultLotValue]: (state, { payload: data }) => {
        return { ...state, tempDefaultLotValue: data }
    },
    [Actions.tempDefaultOther]: (state, { payload: data }) => {
        return { ...state, tempDefaultOther: data }
    },
    [Actions.defaultRelease]: (state, { payload: data }) => {
        return { ...state, defaultRelease: data }
    },
    [Actions.defaultTally]: (state, { payload: data }) => {
        return { ...state, defaultTally: data }
    },
    [Actions.defaultTruck]: (state, { payload: data }) => {
        return { ...state, defaultTruck: data }
    }
}, initialState)

//Exports
export default reducer