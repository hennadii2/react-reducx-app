import Actions from '../Redux/Actions'
import { formatDate } from './DateFunc'

function getReceipts(fromDate, toDate, salesRep) {
    const params = [
        {
            paramName: 'fDate',
            paramType: 'date',
            paramValue: formatDate(fromDate)
        },
        {
            paramName: 'tDate',
            paramType: 'date',
            paramValue: formatDate(toDate)
        },
        {
            paramName: 'sRep',
            paramType: 'varchar',
            paramValue: salesRep
        }
    ]
    Fetch('POST', '/commissionReceipts', params, response => {
        if (response.recordset) {
            props.dispatch(Actions.receipts(response.recordset))
        }
    })
}

export default {
    getReceipts
}