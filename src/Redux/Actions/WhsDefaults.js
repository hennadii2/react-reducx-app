import { createActions } from 'redux-actions'

//variables to store values for Warehouse defaults grid
export const {
    whsDefaults,
    whsHeaders
} = createActions({
    WHS_DEFAULTS: (data) => data,
    WHS_HEADERS: (data )=> data
})