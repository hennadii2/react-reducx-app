//import npm functions
import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import DatePicker from 'react-date-picker'
import { DropdownMenu, DropdownItem, Label, ButtonDropdown, DropdownToggle } from 'reactstrap'

//import custom functions
import Actions from '../Redux/Actions'
import Fetch from '../Functions/Fetch'
import CreateHeaders from '../Functions/CreateHeaders'
import {newDate, formatDate} from '../Functions/DateFunc'

//import custom components
import SalespersonFilter from './SalespersonFilter'
import Table from './Table'

function Receipts(props) {
    //parameters to create receipts grid
    const receiptParams = {
        id: 'Receipts',
        row: (data) => { props.dispatch(Actions.selectedReceipt(data)) }
    }

    //Receipt grid parameters
    //variable for from date and onChange function
    const [fromDate, setFromDate] = useState()
    const changeFromDate = date => { setFromDate(date); }

    //variable for to date and onChange function
    const [toDate, setToDate] = useState()
    const changeToDate = date => { setToDate(date); }

    //variable and function to create a drop down for quick date options
    const [dateOptionsOpen, setDateOptionsOpen] = useState(false)
    const changeDateOptionsOpen = () => setDateOptionsOpen(!dateOptionsOpen)

    //variable for quick date option and function to change
    const [dateOption, setDateOption] = useState('Previous Week')
    const changeDateOption = option => setDateOption(option.target.value)

    //variable and function to create a drop down fro sales representative filter
    const [salesRepOptionsOpen, setSalesRepOptionsOpen] = useState(false)
    const changeSalesRepOptionsOpen = () => setSalesRepOptionsOpen(!salesRepOptionsOpen)

    //variable for selected sales representative and function to change it
    const [salesRep, setSalesRep] = useState(null)
    const changeSalesRepOption = option => setSalesRep(option.target.value)

    //variable to store and display totals for receipt grid
    const [totalWgt, setTotalWgt] = useState(0)
    const [totalGP, setTotalGP] = useState(0)
    const [unConfdPO, setUnConfdPO] = useState(0)
    const [unConfdInv, setUnConfdInv] = useState(0)

    //Reset selected receipt on reload
    useEffect(() => {
        if (props.receipts.receipts === null) {
            props.dispatch(Actions.selectedReceipt(null))
        } else {
            if (props.receipts.receipts.length === 0) {
                props.dispatch(Actions.selectedReceipt(null))
            }
        }
    }, [])

    //update from and to date on date option selection
    useEffect(() => {
        switch (dateOption) {
            case 'Previous Week':
                setFromDate(newDate(new Date(), (new Date().getDay() + 7) * -1))
                setToDate(newDate(new Date(), -1 - (new Date().getDay())))
                break
            case 'Previous Week x2':
                setFromDate(newDate(new Date(), (new Date().getDay() + 14) * -1))
                setToDate(newDate(new Date(), -8 - (new Date().getDay())))
                break
            case 'Previous Week x3':
                setFromDate(newDate(new Date(), (new Date().getDay() + 21) * -1))
                setToDate(newDate(new Date(), -15 - (new Date().getDay())))
                break
            case 'Current Month YTD':
                setFromDate(new Date(new Date().getFullYear(), 0, 1))
                setToDate(new Date())
                break
            case 'Last Month':
                setFromDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))
                setToDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0))
                break
            default:
                setFromDate(newDate(new Date(), (new Date().getDay()) * -1))
                setToDate(new Date())
                break
        }
    }, [dateOption])

    //Get Reciept on parameter change
    useEffect(() => {
        if (fromDate && toDate) {
            getReceipts()
            props.dispatch(Actions.selectedReceipt(null))
            props.dispatch(Actions.updateReceipts(false))
        }
        props.dispatch(Actions.fromDate(fromDate))
        props.dispatch(Actions.toDate(toDate))
    }, [fromDate, toDate, salesRep])

    //Fetch Receipts from API server
    function getReceipts() {
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

    //Create table headers
    useEffect(() => {
        if (props.receipts.receipts !== null) {
            if (props.receipts.receipts.length > 0) {
                props.dispatch(Actions.receiptHeaders(CreateHeaders(receiptParams, props.receipts.receipts[0])))
                props.dispatch(Actions.updateReceipts(false))
                let wgt = 0, gp = 0, unconfirmedPO = 0, unconfirmedInv = 0
                for (let index = 0; index < props.receipts.receipts.length; index++) {
                    const element = props.receipts.receipts[index]
                    wgt += element.Weight
                    gp += element['Gross Profit']
                    if (element['PO Ver\'d'] === false) { unconfirmedPO += 1 }
                    if (element['Inv Ver\'d'] === false) { unconfirmedInv += 1 }
                }

                setTotalWgt(wgt.toFixed(2))
                setTotalGP(gp.toFixed(2))
                setUnConfdPO(unconfirmedPO)
                setUnConfdInv(unconfirmedInv)
            } else {
                setTotalWgt(0)
                setTotalGP(0)
                setUnConfdPO(0)
                setUnConfdInv(0)
            }
        } else {
            setTotalWgt(0)
            setTotalGP(0)
            setUnConfdPO(0)
            setUnConfdInv(0)
        }
    }, [props.receipts.receipts])

    //function to update receipts post confirmation of PO
    useEffect(() => {
        if (props.receipts.updateReceipts) {
            getReceipts()
        }
    }, [props.receipts.updateReceipts])

    return (
        <div>
            <Label for='fromDate'>From Date: </Label>{'  '}
            <DatePicker id='fromDate' onChange={changeFromDate} value={fromDate} />
            {' '}
            <Label for='toDate'>To Date: </Label>{'  '}
            <DatePicker id='toDate' onChange={changeToDate} value={toDate} />
            {'  '}
            <Label for='quickDate'>Quick Date: </Label>{'  '}
            <ButtonDropdown id='quickDate' isOpen={dateOptionsOpen} toggle={changeDateOptionsOpen}>
                <DropdownToggle caret color='info'>
                    {dateOption}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={changeDateOption} value='Current Week'>Current Week</DropdownItem>
                    <DropdownItem onClick={changeDateOption} value='Previous Week'>Previous Week</DropdownItem>
                    <DropdownItem onClick={changeDateOption} value='Previous Week x2'>Previous Week x2</DropdownItem>
                    <DropdownItem onClick={changeDateOption} value='Previous Week x3'>Previous Week x3</DropdownItem>
                    <DropdownItem onClick={changeDateOption} value='Current Month YTD'>Current Month YTD</DropdownItem>
                    <DropdownItem onClick={changeDateOption} value='Last Month'>Last Month</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
            {'  '}
            <Label for='salesRep'>Sales Rep: </Label>{'  '}
            <ButtonDropdown id='salesRep' isOpen={salesRepOptionsOpen} toggle={changeSalesRepOptionsOpen}>
                <DropdownToggle caret color='info'>
                    {salesRep}
                </DropdownToggle>
                <SalespersonFilter changeRep={changeSalesRepOption} />
            </ButtonDropdown>
            <div className='GridSize'>
                <Table id='Receipts' activeTab={props.activeTab} selectRow={row=>{props.dispatch(Actions.selectedReceipt(row))}}/>
            </div>
            <div className='receiptInfo'>
                <div style={{ marginLeft: '890px' }}>
                    Total Weight:{' '}
                    <input type='text' readOnly style={{ width: '60px', textAlign: 'right' }} value={totalWgt} />
                    <label style={{ marginLeft: '60px', width: '60px', textAlign: 'right' }}>Total GP:{' '}</label>
                    <input type='text' readOnly style={{ width: '60px', textAlign: 'right', marginLeft: '2pm' }} value={totalGP} />
                    <label style={{ width: '120px', textAlign: 'right' }}>To be confirmed:{' '}</label>
                    <input type='text' readOnly style={{ width: '36px', textAlign: 'right' }} value={unConfdPO} />
                    <input type='text' readOnly style={{ width: '36px', textAlign: 'right' }} value={unConfdInv} />
                </div>
            </div>
        </div>
    )
}
Receipts.defaultProps = {

}

const mapStateToProps = ({ receipts }) => ({ receipts })
export default connect(mapStateToProps)(Receipts)