import React, { useState, useEffect, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { Label, Alert, Row, Col, Button } from 'reactstrap'

//imports from custom fuctions
import CreateHeaders from '../Functions/CreateHeaders'
import Actions from '../Redux/Actions'
import Fetch from '../Functions/Fetch'
import Table from './Table'
import { reloadInvoice } from '../Redux/Actions/Invoice'


function Invoices(props) {
    //variable and functions to control focused element
    const UseFocus = () => {
        const htmlElRef = useRef(null)
        const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }

        return [htmlElRef, setFocus]
    }

    //variables for invoice no and confirm invoice
    const [invNo, setInvNo] = useState('')
    const [invNoRef, setInvNoFocus] = UseFocus()

    //variables to store err messages and dispaly to the users
    const [errMsg, setErrMsg] = useState('')
    const [showAlert, setShowAlert] = useState(false)

    //Trigger to display error message
    useEffect(() => {
        if (errMsg === '') {
            setShowAlert(false)
        } else {
            setShowAlert(true)
        }
    }, [errMsg])

    const [updateInvoice, setUpdateInvoice] = useState(false)
    const [iConfirm, setIConfirm_] = useState(false)

    //Nomura's Changes
    const iConfirmRef = useRef(iConfirm)
    const setIConfirm = d => {
        iConfirmRef.current = d
        setIConfirm_(d)
    }

    useEffect(() => {
        if (props.activeTab == "2") {
            if (props.keyCode.key === 106) {
                // console.log('Update Invoice:' + updateInvoice, 'iConfirm:' + iConfirm
                //     , 'Enable Invoice Unconfirm:' + props.defaults.enableInvoiceUnconfirm
                //     , 'Disable Invoice Confirm:' + props.defaults.disableInvoiceConfirm)                                
                props.dispatch(Actions.invoiceConfirm(!iConfirm))
                if (iConfirm) {
                    if (props.defaults.enableInvoiceUnconfirm) {
                        setIConfirm(!iConfirmRef.current)
                        setInvNoFocus()
                    }
                } else {
                    if (!props.defaults.disableInvoiceConfirm && updateInvoice) {
                        setIConfirm(!iConfirmRef.current)
                        setInvNoFocus()
                    }
                }
            }
        } else {
            setInvNo('');
            setIConfirm(false);            
            props.dispatch(Actions.invoiceConfirm(null))            
        }
    }, [props.activeTab, props.keyCode])


    useEffect(() => {
        confirmInv()
    }, [iConfirm])

    //function to confirm or unconfirm invoice
    function confirmInv() {
        // console.log('Update Invoice:' + updateInvoice, 'iConfirm:' + iConfirm
        // , 'Enable Invoice Unconfirm:' + props.defaults.enableInvoiceUnconfirm
        // , 'Disable Invoice Confirm:' + props.defaults.disableInvoiceConfirm)
        if (props.invoice.invoice) {
            //props.dispatch(Actions.invoiceConfirm(!props.invoice.invoiceConfirm))
            for (let index = 0; index < props.invoice.invoice.length; index++) {
                const element = props.invoice.invoice[index];
                let iConfirmVal = 'Y';
                if ( props.invoice.invoiceConfirm ===null) {
                    iConfirmVal = iConfirm ? 'Y' : 'N' ;
                }else {
                    iConfirmVal = props.invoice.invoiceConfirm ? 'Y' : 'N' ;
                }
                let params = [
                    {
                        paramName: 'InvoiceNo',
                        paramType: 'varchar',
                        paramLength: 7,
                        paramValue: element.InvoiceNo
                    },
                    {
                        paramName: 'Confirm',
                        paramType: 'varchar',
                        paramLength: 1,
                        paramValue: iConfirmVal
                    },
                    {
                        paramName: 'RowsUpdated',
                        paramType: 'int',
                        paramDirection: 'OUTPUT'
                    }
                ]
                // console.log(params)
                Fetch('POST', '/commissionConfirmInv', params, function (data, err) {
                    // console.log(data, err)
                    if (err !== undefined) { setErrMsg(err) }
                    else {
                        if (data.output.RowsUpdated > 0) {
                            // console.log('reload for confirm/unconfirm')
                            props.dispatch(Actions.reloadInvoice(true))
                            if (iConfirm) {
                                props.dispatch(Actions.invoiceRowIndex(0))
                            } else {
                                setInvNo(element.InvoiceNo)
                                props.dispatch(Actions.invoiceRowIndex(13))
                                setReleaseFocus()
                            }
                        }
                    }
                })
            }
        }
    }

    //Trigger to ftech invoice from API server
    useEffect(() => {
        if (invNo.length > 6) {
            props.dispatch(Actions.invoice(null))
            props.dispatch(Actions.selectedInvoiceLine(null))
            setUpdateInvoice(false)
            props.dispatch(Actions.invoiceClmnIndex(0))
            props.dispatch(Actions.invoiceRowIndex(null))
            props.dispatch(Actions.reloadInvoice(false))
            // props.dispatch(Actions.invoiceRowIndex(0))
            // props.dispatch(Actions.invoiceClmnIndex(12))
            // const timeoutIdInv = setTimeout(() => getInvoice(), 100)
            // return () => clearTimeout(timeoutIdInv);
            getInvoice()
        }
    }, [invNo])

    //function to fetch invoice from API server
    function getInvoice() {
        const params = [
            {
                paramName: 'InvoiceNo',
                paramType: 'varchar',
                paramLength: 7,
                paramValue: invNo
            }
        ]
        // console.log(params)
        Fetch('POST', '/commissionInvoice', params, function (data, err) {
            if (err) { setErrMsg(err) }
            // console.log(data)
            if (data) {
                if (data.recordset) {
                    props.dispatch(Actions.invoice(data.recordset))
                } else if (data.data) {
                    setErrMsg(data.data)
                }
            }
        })
    }

    //parameters to create table headers
    const [headerParams, setHeaderParams] = useState([])

    // Trigger header params update when cell changes
    useEffect(() => {
        if (invNo !== '') { setParams() }
    }, [props.invoice.invoiceRowIndex, props.invoice.invoiceClmnIndex])

    // Update header params when cell changes
    const setParams = useCallback(() => {
        setHeaderParams({
            id: 'Invoice',
            RowIndex: data => { props.dispatch(Actions.invoiceRowIndex(data)) },
            ClmnIndex: data => { props.dispatch(Actions.invoiceClmnIndex(data)) },
            rIndex: props.invoice.invoiceRowIndex,
            cIndex: props.invoice.invoiceClmnIndex
        })
    }, [props.invoice.invoiceRowIndex, props.invoice.invoiceClmnIndex])

    //variables to store and display invoice information
    //const [lotNo, setLotNo] = useState('')
    const [customer, setCustomer] = useState('')
    const [customerNo, setCustomerNo] = useState('')
    const [brokerage, setBrokerage] = useState(0)
    const [salesRep, setSalesRep] = useState('')
    const [freight, setFreight] = useState(0)
    const [invDate, setInvDate] = useState('')
    const [customerPO, setCustomerPO] = useState('')
    const [netInv, setNetInv] = useState(0)
    const [balance, setBalance] = useState(0)
    const [shipVia, setShipVia] = useState(0)

    //variables to store and display invoice totals
    const [totalStorage, setTotalStorage] = useState(0)
    const [totalRelease, setTotalRelease] = useState(0)
    const [totalTally, setTotalTally] = useState(0)
    const [totalTruck, setTotalTruck] = useState(0)
    const [totalOther, setTotalOther] = useState(0)
    const [totalGP, setTotalGP] = useState(0)
    const [totalGPLB, setTotalGPLB] = useState(0)

    //variables to allow data entry to update invoice
    const [newStorage, setNewStorage] = useState()
    const [newRelease, setNewRelease] = useState()
    const [newTally, setNewTally] = useState()
    const [newTruck, setNewTruck] = useState()
    const [newOther, setNewOther] = useState()
    const [storageRef, setStorageFocus] = UseFocus()
    const [releaseRef, setReleaseFocus] = UseFocus()
    const [tallyRef, setTallyFocus] = UseFocus()
    const [truckRef, setTruckFocus] = UseFocus()
    const [otherRef, setOtherFocus] = UseFocus()
    const [newTally1, setNewTally1] = useState()
    const [newTruck1, setNewTruck1] = useState()
    const [newOther1, setNewOther1] = useState()
    const [tallyRef1, setTallyFocus1] = UseFocus()
    const [truckRef1, setTruckFocus1] = UseFocus()
    const [otherRef1, setOtherFocus1] = UseFocus()

    //Trigger to update invoice post changes
    useEffect(() => {
        // console.log(props.invoice.reloadInvoice)
        if (props.invoice.reloadInvoice) {
            props.dispatch(Actions.reloadInvoice(false))
            getInvoice()
        }
    }, [props.invoice.reloadInvoice])

    //Trigger to create table headers for invoice grid and set totals
    useEffect(() => {
        let storage = 0, release = 0, tally = 0, truck = 0, other = 0, gp = 0, gplb = 0, rfee = 0
        if (props.invoice.invoice) {
            if (props.invoice.invoice[0] !== undefined) {
                if (props.invoice.invoice.length > 0) {
                    props.dispatch(Actions.invoiceHeaders(CreateHeaders(headerParams, props.invoice.invoice[0])))
                    for (let index = 0; index < props.invoice.invoice.length; index++) {
                        const element = props.invoice.invoice[index]
                        storage += element['Storage']
                        release += element['Release']
                        tally += element['Tally']
                        truck += element['Truck']
                        other += element['Other']
                        gp += element['GP']
                        gplb += element['GPLB']
                        rfee += element['Roll Fee']
                    }
                    setTotalStorage(storage.toFixed(2))
                    setTotalRelease(release.toFixed(2))
                    setTotalTally(tally.toFixed(2))
                    setTotalTruck(truck.toFixed(2))
                    setTotalOther(other.toFixed(2))
                    setTotalGP(gp.toFixed(2))
                    setTotalGPLB(gplb.toFixed(2))
                    isInvConfirmed()
                    if (storage === 0 && rfee !== 0) {
                        let morethan29days = false
                        for (let index = 0; index < props.invoice.invoice.length; index++) {
                            const element = props.invoice.invoice[index]
                            // console.log(element['Days'])
                            if (element['Days'] > 29 ) {
                                if (element['Roll Fee'] !== 0) {
                                    morethan29days = true
                                    let storageValue = element['Weight'] * element['Roll Fee']
                                    runUpdateSkipLineChange(element, 'Storage', storageValue)
                                }
                            }
                        }
                        if (morethan29days) {
                            // console.log('reload for storage')
                            const timeoutIdInv = setTimeout(() => getInvoice(), 10)
                            return () => clearTimeout(props.dispatch(Actions.reloadInvoice(true)));
                        }
                    }
                } else {
                    setTotalStorage(storage.toFixed(2))
                    setTotalRelease(release.toFixed(2))
                    setTotalTally(tally.toFixed(2))
                    setTotalTruck(truck.toFixed(2))
                    setTotalOther(other.toFixed(2))
                    setTotalGP(gp.toFixed(2))
                    setTotalGPLB(gplb.toFixed(2))
                }
            } else {
                setTotalStorage(storage.toFixed(2))
                setTotalRelease(release.toFixed(2))
                setTotalTally(tally.toFixed(2))
                setTotalTruck(truck.toFixed(2))
                setTotalOther(other.toFixed(2))
                setTotalGP(gp.toFixed(2))
                setTotalGPLB(gplb.toFixed(2))
            }
        } else {
            setTotalStorage(storage.toFixed(2))
            setTotalRelease(release.toFixed(2))
            setTotalTally(tally.toFixed(2))
            setTotalTruck(truck.toFixed(2))
            setTotalOther(other.toFixed(2))
            setTotalGP(gp.toFixed(2))
            setTotalGPLB(gplb.toFixed(2))
        }
    }, [JSON.stringify(props.invoice.invoice), props.invoice.invoice, JSON.stringify(headerParams)])

    //Verify if invoice is confirmed
    function isInvConfirmed() {
        if (invNo !== '') {
            let params = [
                {
                    paramName: 'Method',
                    paramType: 'varchar',
                    paramLength: 6,
                    paramValue: 'GET'
                },
                {
                    paramName: 'InvoiceNo',
                    paramType: 'varchar',
                    paramLength: 7,
                    paramValue: invNo
                }
            ]
            // console.log(params)
            Fetch('POST', '/commissionConfirmInv', params, (data, err) => {
                // props.dispatch(Actions.invoiceClmnIndex(0))
                if (err) { setErrMsg(err) }
                if (data) {
                    if (data.recordset[0] !== undefined) {
                        // console.log(data.recordset)
                        setIConfirm(data.recordset[0].Confirmed === 'Y' ? true : false)
                        if (data.recordset[0].Confirmed !== 'Y') {
                            if (props.invoice.selectedInvoiceLine === null || props.invoice.selectedInvoiceLine === undefined) {
                                props.dispatch(Actions.invoiceRowIndex(0))
                                //props.dispatch(Actions.selectedInvoiceLine(props.invoice.invoice[0]))
                                props.dispatch(Actions.invoiceClmnIndex(13))
                                setUpdateInvoice(true)
                            }
                        } else { 
                            setInvNoFocus()
                            //setInvNo('');
                            document.getElementById('InvNo').select()
                        }
                    } else {
                        setIConfirm(false)
                    }
                } else {
                    setIConfirm(false)
                }
                props.dispatch(Actions.invoiceConfirm(iConfirm))
            })
        }
    }

    //Trigger to update Invoice line information
    useEffect(() => {
        if (props.invoice.invoice !== null) {
            if (props.invoice.invoice !== undefined) {
                if (props.invoice.invoice.length > 0) {
                    if (props.invoice.selectedInvoiceLine !== null && props.invoice.selectedInvoiceLine !== undefined) {
                        let params = [
                            {
                                paramName: 'InvoiceNo',
                                paramType: 'varchar',
                                paramLength: 7,
                                paramValue: props.invoice.selectedInvoiceLine.InvoiceNo
                            },
                            {
                                paramName: 'HeaderSeqNo',
                                paramType: 'varchar',
                                paramLength: 6,
                                paramValue: props.invoice.selectedInvoiceLine.HSeq
                            },
                            {
                                paramName: 'DetailSeqNo',
                                paramType: 'varchar',
                                paramLength: 6,
                                paramValue: props.invoice.selectedInvoiceLine.DSeq
                            }
                        ]
                        Fetch('POST', '/commissionsInvInfo', params, (data, err) => {
                            if (err) { setErrMsg(err) }
                            if (data.recordset[0] !== undefined) {
                                props.dispatch(Actions.lotNo(data.recordset[0].LotSerialNo))
                                setCustomer(data.recordset[0].BillToName)
                                setCustomerNo(data.recordset[0].CustomerNo)
                                setBrokerage(data.recordset[0].Brokerage.toFixed(2))
                                setSalesRep(data.recordset[0].SalespersonName)
                                setFreight(data.recordset[0].Freight.toFixed(2))
                                setInvDate(data.recordset[0].InvoiceDate)
                                setCustomerPO(data.recordset[0].CustomerPONo)
                                setNetInv(data.recordset[0].NetInvoice.toFixed(2))
                                setBalance(data.recordset[0].Balance.toFixed(2))
                                setShipVia(data.recordset[0].ShipVia)
                                if (data.recordset[0].Freight !== 0 && totalTruck == 0) {
                                    let totWeight = 0
                                    for (let i = 0; i < props.invoice.invoice.length; i++) {
                                        totWeight += props.invoice.invoice[i].Weight
                                    }
                                    for (let i = 0; i < props.invoice.invoice.length; i++) {
                                        let truckValue = (data.recordset[0].Freight * props.invoice.invoice[i].Weight) / totWeight
                                        if (truckValue > props.defaults.defaultTruck) {
                                            setErrMsg('Truck Charge cannot be over ' + props.defaults.defaultTruck)
                                            truckValue = props.defaults.defaultTruck
                                        }
                                        runUpdateSkipLineChange(props.invoice.invoice[i], "Truck", truckValue)
                                    }
                                    // console.log('reload for truck')
                                    props.dispatch(Actions.reloadInvoice(true))
                                    setNewTruck1('')
                                }
                                if (data.recordset[0].Brokerage !== 0 && totalOther == 0) {
                                    let totWeight = 0
                                    for (let i = 0; i < props.invoice.invoice.length; i++) {
                                        totWeight += props.invoice.invoice[i].Weight
                                    }
                                    for (let i = 0; i < props.invoice.invoice.length; i++) {
                                        let otherValue = (data.recordset[0].Brokerage * props.invoice.invoice[i].Weight) / totWeight
                                        runUpdateSkipLineChange(props.invoice.invoice[i], "Other", otherValue)
                                    }
                                    // console.log('reload for truck')
                                    props.dispatch(Actions.reloadInvoice(true))
                                    setNewOther1('')
                                }
                            }
                        })
                    } else {
                        props.dispatch(Actions.lotNo(''))
                        setCustomer('')
                        setCustomerNo('')
                        setBrokerage(0)
                        setSalesRep('')
                        setFreight(0)
                        setInvDate('')
                        setCustomerPO('')
                        setNetInv(0)
                        setBalance(0)
                        setShipVia('')
                    }
                } else {
                    props.dispatch(Actions.lotNo(''))
                    setCustomer('')
                    setCustomerNo('')
                    setBrokerage(0)
                    setSalesRep('')
                    setFreight(0)
                    setInvDate('')
                    setCustomerPO('')
                    setNetInv(0)
                    setBalance(0)
                    setShipVia('')
                }
            } else {
                props.dispatch(Actions.lotNo(''))
                setCustomer('')
                setCustomerNo('')
                setBrokerage(0)
                setSalesRep('')
                setFreight(0)
                setInvDate('')
                setCustomerPO('')
                setNetInv(0)
                setBalance(0)
                setShipVia('')
            }
        } else {
            props.dispatch(Actions.lotNo(''))
            setCustomer('')
            setCustomerNo('')
            setBrokerage(0)
            setSalesRep('')
            setFreight(0)
            setInvDate('')
            setCustomerPO('')
            setNetInv(0)
            setBalance(0)
            setShipVia('')
        }
    }, [props.invoice.selectedInvoiceLine, JSON.stringify(props.invoice.selectedInvoiceLine), props.invoice.invoiceRowIndex])

    //function to select data entry field when certain column is selected on invoice grid
    const columnSelect = (column) => {
        //console.log(column.dataField, type)
        if (!iConfirm) {
            switch (column.dataField) {
                case 'Storage':
                    setType(null)
                    setStorageFocus()
                    break
                case 'Release':
                    setReleaseFocus()
                    break
                case 'Tally':
                    switch (type) {
                        case 0:
                            setTallyFocus()
                            break
                        default:
                            setTallyFocus1()
                            break
                    }
                    break
                case 'Truck':
                    switch (type) {
                        case 0:
                            setTruckFocus()
                            break
                        default:
                            setTruckFocus1()
                            break
                    }
                    break
                case 'Other':
                    switch (type) {
                        case 0:
                            setOtherFocus()
                            break
                        default:
                            setOtherFocus1()
                            break
                    }
                    break
                default:
                    break;
            }
        }
    }

    //function to change column selected in invoice grid
    useEffect(() => {
        if (props.invoice.invoiceHeaders !== null) {
            if (props.invoice.invoiceClmnIndex !== null) { columnSelect(props.invoice.invoiceHeaders[props.invoice.invoiceClmnIndex + 1]) }
        }
    }, [props.invoice.invoiceHeaders])

    //function to change row selected in Invoice grid
    useEffect(() => {
        if (props.invoice.invoice !== null) {
            if (props.invoice.invoiceRowIndex !== null) {
                props.dispatch(Actions.selectedInvoiceLine(props.invoice.invoice[props.invoice.invoiceRowIndex]))
            }
        }
    }, [props.invoice.invoiceRowIndex, props.invoice.invoice])

    //Variable to control the focus to enter appropriate data entry field
    const [type, setType] = useState(null)

    //Trigger to move between the data entry fields for same column
    useEffect(() => {
        if (props.invoice.invoiceHeaders !== null) {
            columnSelect(props.invoice.invoiceHeaders[props.invoice.invoiceClmnIndex + 1])
        }
    }, [type])

    //function to control data entry on invoice grid
    const keyDown = (e, field) => {
        //console.log(e.keyCode, updateInvoice)
        setShowAlert(false)
        switch (e.keyCode) {
            case 13:
                e.preventDefault()
                if (field === 'InvNo') {
                    props.dispatch(Actions.selectedInvoiceLine(null))
                    // setUpdateInvoice(false)
                    props.dispatch(Actions.invoice([]))
                    getInvoice()
                } else {
                    if (props.invoice.invoice.length > props.invoice.invoiceRowIndex + 1) {
                        props.dispatch(Actions.invoiceRowIndex(props.invoice.invoiceRowIndex + 1))
                    }
                }
                // if (e.target.value !== '') {
                if (field === 'Release') {
                    let releaseValue = 0
                    if (e.target.value === '') {
                        if (e.target.value !== '') { releaseValue = e.target.value }
                        if (releaseValue == 0) {
                            let whsInfo
                            if (props.whsDefaults.whsDefaults !== null) {
                                for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                                    if (props.whsDefaults.whsDefaults[index].Whs === props.invoice.selectedInvoiceLine.Whs) {
                                        whsInfo = props.whsDefaults.whsDefaults[index]
                                    }
                                }
                            }
                            if (whsInfo !== null && whsInfo !== undefined) {
                                releaseValue = whsInfo.ReleaseCost
                            }
                        }
                    } else {
                        releaseValue = e.target.value
                    }
                    if (parseFloat(releaseValue) > parseFloat(props.defaults.defaultRelease)) {
                        setErrMsg(("Default Release Cost cannot be over " + props.defaults.defaultRelease))
                        releaseValue = props.defaults.defaultRelease
                    }
                    runUpdate(props.invoice.selectedInvoiceLine, field, releaseValue)
                    setNewRelease('')
                } else if (field === 'Truck') {
                    if (e.target.value !== '') {
                        let truckValue = 0
                        truckValue = e.target.value
                        let totalTruckValue = 0
                        for (let i = 0; i < props.invoice.invoice.length; i++) {
                            totalTruckValue += props.invoice.invoice[i].Truck
                        }
                        totalTruckValue -= props.invoice.selectedInvoiceLine.Truck
                        if (totalTruckValue + truckValue > props.defaults.defaultTruck) {
                            setErrMsg("Truck Charge cannot be over " + props.defaults.defaultTruck)
                            truckValue = props.defaults.defaultTruck - totalTruckValue
                        }
                        runUpdate(props.invoice.selectedInvoiceLine, field, truckValue)
                    }
                    setNewTruck('')
                } else if (field === 'Tally1') {
                    let tallyValue = 0
                    if (e.target.value != 0 || e.target.value === '') {
                        let whsInfo
                        if (e.target.value !== '') { tallyValue = e.target.value }
                        if (props.whsDefaults.whsDefaults !== undefined) {
                            for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                                if (props.whsDefaults.whsDefaults[index].Whs === props.invoice.selectedInvoiceLine.Whs) {
                                    whsInfo = props.whsDefaults.whsDefaults[index]
                                }
                            }
                        }
                        if (tallyValue == 0) { tallyValue = whsInfo.TallyCost }
                        if (tallyValue > props.defaults.defaultTally) {
                            setErrMsg('Tally charge cannot be over ' + props.defaults.defaultTally)
                            tallyValue = props.defaults.defaultTally
                        }
                        tallyValue = tallyValue * props.invoice.selectedInvoiceLine.Cases
                        if (tallyValue < whsInfo.TallyMin) {
                            setErrMsg('Tally charge for the warehouse ' + props.invoice.selectedInvoiceLine.whs + ' cannot be less than ' + whsInfo.TallyMin)
                            tallyValue = whsInfo.TallyMin
                        }
                    }
                    runUpdate(props.invoice.selectedInvoiceLine, "Tally", tallyValue)
                    setNewTally1('')
                } else if (field === 'Truck1') {
                    if (e.target.value !== '') {
                        if (e.target.value != 0 || e.target.value === '') {
                            let totWeight = 0
                            for (let i = 0; i < props.invoice.invoice.length; i++) {
                                totWeight += props.invoice.invoice[i].Weight
                            }
                            let totalTruckValue = e.target.value
                            if (totalTruckValue > props.defaults.defaultTruck) {
                                setErrMsg('Truck Charge cannot be over ' + props.defaults.defaultTruck)
                                totalTruckValue = props.defaults.defaultTruck
                            }
                            for (let i = 0; i < props.invoice.invoice.length; i++) {
                                let truckValue = (totalTruckValue * props.invoice.invoice[i].Weight) / totWeight
                                runUpdate(props.invoice.invoice[i], "Truck", truckValue)
                            }
                        } else {
                            for (let i = 0; i < props.invoice.invoice.length; i++) {
                                runUpdate(props.invoice.invoice[i], "Truck", e.target.value)
                            }
                        }
                        setNewTruck1('')
                    }
                } else if (field === 'Other1') {
                    if (e.target.value !== '') {
                        if (e.target.value != 0 || e.target.value === '') {
                            let totWeight = 0
                            for (let i = 0; i < props.invoice.invoice.length; i++) {
                                totWeight += props.invoice.invoice[i].Weight
                            }
                            for (let i = 0; i < props.invoice.invoice.length; i++) {
                                let otherValue = (e.target.value * props.invoice.invoice[i].Weight) / totWeight
                                runUpdate(props.invoice.invoice[i], "Other", otherValue)
                            }
                        } else {
                            for (let i = 0; i < props.invoice.invoice.length; i++) {
                                runUpdate(props.invoice.invoice[i], "Other", e.target.value)
                            }
                        }
                        setNewOther1('')
                    }
                } else {
                    if (e.target.value !== '') {
                        runUpdate(props.invoice.selectedInvoiceLine, field, e.target.value)
                        setNewStorage('')
                        setNewTally('')
                        setNewOther('')
                    }
                }
                // } 
                break
            case 107:
                e.preventDefault()
                props.dispatch(Actions.invoiceRowIndex(0))
                switch (field) {
                    case 'Other':
                    case 'Other1':
                        props.dispatch(Actions.invoiceClmnIndex(props.invoice.invoiceClmnIndex - 4))
                        break
                    default:
                        props.dispatch(Actions.invoiceClmnIndex(props.invoice.invoiceClmnIndex + 1))
                        break
                }
                break
            case 111:
                e.preventDefault()
                switch (field) {
                    case 'Tally1':
                    case 'Truck1':
                    case 'Other1':
                        setType(0)
                        break
                    default:
                        setType(null)
                        break
                }
                break
            case 38:
                e.preventDefault()
                if (props.invoice.invoiceRowIndex > 0) {
                    props.dispatch(Actions.invoiceRowIndex(props.invoice.invoiceRowIndex - 1))
                }
                break
            case 40:
                e.preventDefault()
                if (props.invoice.invoice.length > props.invoice.invoiceRowIndex + 1) {
                    props.dispatch(Actions.invoiceRowIndex(props.invoice.invoiceRowIndex + 1))
                }
                break
            case 106:
                e.preventDefault()
                break
            default:
                break
        }
    }

    //function to update overhead for invoice grid
    function runUpdate(row, field, value) {
        if (row) {
            let params = [
                {
                    paramName: 'InvoiceNo',
                    paramType: 'varchar',
                    paramLength: 7,
                    paramValue: row.InvoiceNo
                },
                {
                    paramName: 'HeaderSeqNo',
                    paramType: 'varchar',
                    paramLength: 6,
                    paramValue: row.HSeq
                },
                {
                    paramName: 'DetailSeqNo',
                    paramType: 'varchar',
                    paramLength: 6,
                    paramValue: row.DSeq
                },
                {
                    paramName: 'fieldName',
                    paramType: 'varchar',
                    paramLength: 20,
                    paramValue: field
                },
                {
                    paramName: 'Value',
                    paramType: 'decimal',
                    paramPrecision: 19,
                    paramScale: 6,
                    paramValue: value
                },
                {
                    paramName: 'Result',
                    paramType: 'int',
                    paramDirection: 'OUTPUT'
                }
            ]
            // console.log(params)
            let msg = ''
            Fetch('POST', '/commissionsUpdateInvExp', params, function (data, err) {
                if (err !== undefined) { msg = err }
                else {
                    if (data.output.Result > 0) {
                        // console.log('reload for manual update')
                        props.dispatch(Actions.reloadInvoice(true))
                        // if (props.invoice.invoice.length > props.invoice.invoiceRowIndex + 1) {
                        //     props.dispatch(Actions.invoiceRowIndex(props.invoice.invoiceRowIndex + 1))
                        // }
                    }
                }
            })
            return (msg)
        }
    }

    //function to update overhead for invoice grid
    function runUpdateSkipLineChange(row, field, value) {
        let params = [
            {
                paramName: 'InvoiceNo',
                paramType: 'varchar',
                paramLength: 7,
                paramValue: row.InvoiceNo
            },
            {
                paramName: 'HeaderSeqNo',
                paramType: 'varchar',
                paramLength: 6,
                paramValue: row.HSeq
            },
            {
                paramName: 'DetailSeqNo',
                paramType: 'varchar',
                paramLength: 6,
                paramValue: row.DSeq
            },
            {
                paramName: 'fieldName',
                paramType: 'varchar',
                paramLength: 20,
                paramValue: field
            },
            {
                paramName: 'Value',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: value
            },
            {
                paramName: 'Result',
                paramType: 'int',
                paramDirection: 'OUTPUT'
            }
        ]
        // console.log(params)
        let msg = ''
        Fetch('POST', '/commissionsUpdateInvExp', params, function (data, err) {
            if (err !== undefined) { msg = err }
            else {
                if (data.output.Result > 0) {
                    // props.dispatch(Actions.reloadInvoice(true))
                }
            }
        })
        return (msg)
    }

    //function to calculate and update storage charges
    function roll() {
        if (props.invoice.selectedInvoiceLine !== null) {
            let storageValue = props.invoice.selectedInvoiceLine.Weight * props.invoice.selectedInvoiceLine['Roll Fee']
            runUpdate(props.invoice.selectedInvoiceLine, 'Storage', storageValue)
        } else {
            setErrMsg('Please select an invoice line')
        }
    }

    function setColor(value) {
        if (value > 0) { return 'lightpink' }
    }

    //html to display invoice grid
    return (
        <div>
            <Row>
                <Col style={{ paddingLeft: '15px' }} xs='1250px'>
                    <div className='InvoiceGrid'>
                        {
                            props.invoice.invoice !== null &&
                            props.invoice.invoice.length > 0 &&
                            // <DataTable id='Invoice' activeTab={props.activeTab} />
                            <Table
                                id='Invoice'
                                activeTab={props.activeTab}
                                selectRow={row => { props.dispatch(Actions.selectedInvoiceLine(row)) }}
                                rowIndex={rowIndex => { props.dispatch(Actions.invoiceRowIndex(rowIndex)) }}
                            />
                        }
                    </div>
                </Col>
                <Col>
                    {props.invoice.invoice === null && <Label style={{ width: '1250px' }} />}
                    <Label for='InvNo' style={{ textAlign: 'center', width: '50px' }} >Invoice No</Label>
                    <input id='InvNo' ref={invNoRef} type='text' style={{ textAlign: 'center', marginLeft: '1px', width: '80px' }} value={invNo}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setInvNo(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'InvNo')}
                    />
                    <br />
                    {props.invoice.invoice === null && <Label style={{ width: '1250px' }} />}
                    <Label for='ConfirmInv' style={{ textAlign: 'right' }} >Inv Confirm</Label>{' '}
                    <input type='checkbox' id='ConfirmInv' name='inv_confirm' checked={iConfirm} onChange={() => { console.log(iConfirm) }} />
                </Col>
            </Row>
            <div className='invoiceInfo'>
                <div >
                    <Label for='Lot' style={{ textAlign: 'right', width: '60px' }}>Lot:</Label>{' '}
                    <input type='text' id='Lot' style={{ width: '130px', height: '20px' }} value={props.invoice.lotNo} readOnly />
                    <Label for='InvDate' style={{ textAlign: 'right', width: '80px', marginLeft: '50px' }}>Invoice Date:</Label>{' '}
                    <input type='text' id='InvDate' style={{ width: '60px', height: '20px', textAlign: 'right' }} value={invDate} readOnly />
                    {props.invoice.invoice !== null && props.invoice.invoice.length < 7 && <Label style={{ width: '0px' }} />}
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right', marginLeft: '436px' }} value={totalStorage} />
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }} value={totalRelease} />
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }} value={totalTally} />
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }} value={totalTruck} />
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }} value={totalOther} />
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }} value={totalGP} />
                    <input type='number' readOnly style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }} value={totalGPLB} />
                </div>
                <div >
                    <Label for='Customer' style={{ textAlign: 'right', width: '60px' }}>Customer:</Label>{' '}
                    <input type='text' id='Customer' style={{ width: '130px', height: '20px' }} value={customer} readOnly />
                    <input type='text' id='CustomerNo' style={{ width: '50px', height: '20px' }} value={customerNo} readOnly />
                    <Label for='Brokerage' style={{ textAlign: 'right', width: '80px' }}>Brokerage Amt:</Label>{' '}
                    <input type='text' id='Brokerage' style={{ width: '60px', height: '20px', textAlign: 'right', backgroundColor: setColor(brokerage) }} value={brokerage} readOnly />
                    <Label for='Freight' style={{ textAlign: 'right', width: '50px' }}>Freight:</Label>{' '}
                    <input type='text' id='Freight' style={{ width: '80px', height: '20px', textAlign: 'right', backgroundColor: setColor(freight) }} value={freight} readOnly />
                    <Label for='NetInv' style={{ textAlign: 'right', width: '60px' }}>Net Invoice:</Label>{' '}
                    <input type='text' id='NetInv' style={{ width: '60px', height: '20px', textAlign: 'right' }} value={netInv} readOnly />
                    {props.invoice.invoice !== null && props.invoice.invoice.length < 7 && <Label style={{ width: '0px' }} />}
                    <Label style={{ width: '60px', textAlign: 'center', marginLeft: '183px' }}>Storage</Label>
                    <Label style={{ width: '60px', textAlign: 'center' }}>Release</Label>
                    <Label style={{ width: '60px', textAlign: 'center' }}>Tally</Label>
                    <Label style={{ width: '60px', textAlign: 'center' }}>Truck</Label>
                    <Label style={{ width: '60px', textAlign: 'center' }}>Other</Label>
                    <Label style={{ width: '60px', textAlign: 'center' }}>GP</Label>
                    <Label style={{ width: '60px', textAlign: 'center' }}>GP/LB</Label>
                </div>
                <div>
                    <Label for='SalesRep' style={{ textAlign: 'right', width: '60px' }}>Sales Rep:</Label>{' '}
                    <input type='text' id='SalesRep' style={{ width: '130px', height: '20px' }} value={salesRep} readOnly />
                    <Label for='CustomerPONo' style={{ textAlign: 'right', width: '80px', marginLeft: '50px' }}>Customer PO:</Label>{' '}
                    <input type='text' id='CustomerPONo' style={{ width: '60px', height: '20px', textAlign: 'right' }} value={customerPO} readOnly />
                    <Label for='ShipVia' style={{ textAlign: 'right', width: '50px' }}>Ship Via:</Label>{' '}
                    <input type='text' id='ShipVia' style={{ width: '80px', height: '20px' }} value={shipVia} readOnly />
                    <Label for='Balance' style={{ textAlign: 'right', width: '60px' }}>Balance:</Label>{' '}
                    <input type='text' id='Balance' style={{ width: '60px', height: '20px', textAlign: 'right' }} value={balance} readOnly />
                    {props.invoice.invoice !== null && props.invoice.invoice.length < 7 && <Label style={{ width: '0px' }} />}
                    <input type='number' ref={storageRef} value={newStorage} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right', marginLeft: '180px' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewStorage(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Storage')}
                        hidden={iConfirm}
                    />
                    <input type='number' ref={releaseRef} value={newRelease} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewRelease(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Release')}
                        hidden={iConfirm}
                    />
                    <input type='number' ref={tallyRef} value={newTally} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewTally(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Tally')}
                        hidden={iConfirm}
                    />
                    <input type='number' ref={truckRef} value={newTruck} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewTruck(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Truck')}
                        hidden={iConfirm}
                    />
                    <input type='number' ref={otherRef} value={newOther} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewOther(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Other')}
                        hidden={iConfirm}
                    />
                </div>
                <div>
                    {props.invoice.invoice !== null && props.invoice.invoice.length < 7 && <Label style={{ width: '20px' }} />}
                    <Button style={{ height: '20px', width: '60px', fontSize: '1em', marginLeft: '801px' }}
                        onClick={() => roll()} hidden={iConfirm}
                    >Roll
                </Button>
                    <input type='number' ref={tallyRef1} value={newTally1} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right', marginLeft: '60px' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewTally1(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Tally1')}
                        hidden={iConfirm}
                    />
                    <input type='number' ref={truckRef1} value={newTruck1} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewTruck1(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Truck1')}
                        hidden={iConfirm}
                    />
                    <input type='number' ref={otherRef1} value={newOther1} readOnly={iConfirm}
                        style={{ fontSize: 'xx-small', width: '60px', height: '20px', textAlign: 'right' }}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewOther1(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'Other1')}
                        hidden={iConfirm}
                    />
                    <br />
                    <br />
                    <br />
                </div>
            </div>
            <Alert color='danger' isOpen={showAlert} toggle={() => setShowAlert(false)}>
                {errMsg}
            </Alert>
        </div>
    )
}

Invoices.defaultProps = {

}
const mapStateToProps = ({ defaults, invoice, whsDefaults }) => ({ defaults, invoice, whsDefaults })
export default connect(mapStateToProps)(Invoices)