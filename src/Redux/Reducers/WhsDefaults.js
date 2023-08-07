import { handleActions } from 'redux-actions'

//import from custom functions
import Actions from "../Actions"

const initialState = {
    whsDefaults: null,
    whsHeaders: null
}

const reducer = handleActions({
    [Actions.whsDefaults]: (state, { payload: data }) => {
        return { ...state, whsDefaults: data }
    },
    [Actions.whsHeaders]: (state, { payload: data }) => {
        return { ...state, whsHeaders: data }
    }
}, initialState)

export default reducer