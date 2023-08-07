//import npm functions
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { Alert, Row, Col, Label } from 'reactstrap'

//import custom functions
import Actions from '../Redux/Actions'
import Fetch from '../Functions/Fetch'
import CreateHeaders from '../Functions/CreateHeaders'

//import custom components
import Table from './Table'

function Purchases(props) {
    //Create Header params
    const [headerParams, setHeaderParams] = useState([])

    // Trigger header params update when cell changes
    useEffect(() => {
        setParams()
    }, [props.purchase.selectedRowIndex, props.purchase.selectedClmnIndex])

    // Update header params when cell changes
    const setParams = useCallback(() => {
        setHeaderParams({
            id: 'Purchases',
            ClmnIndex: data => { props.dispatch(Actions.selectedClmnIndex(data)) },
            RowIndex: data => { props.dispatch(Actions.selectedRowIndex(data)) },
            cIndex: props.purchase.selectedClmnIndex,
            rIndex: props.purchase.selectedRowIndex
        })
    }, [props.purchase.selectedRowIndex, props.purchase.selectedClmnIndex])

    //Function to change the field focused
    const UseFocus = () => {
        const htmlElRef = useRef(null)
        const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }

        return [htmlElRef, setFocus]
    }

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

    //variables to store and display PO information and PO totals
    const [annivDate, setAnnivDate] = useState('')
    const [receiptDate, setReceiptDate] = useState('')
    const [weight, setWeight] = useState(0)
    const [overhead, setOverhead] = useState(0)
    const [truckLine, setTruckLine] = useState(0)
    const [dropLine, setDropLine] = useState(0)
    const [delLine, setDelLine] = useState(0)
    const [storageLine, setStorageLine] = useState(0)
    const [actOverhead, setActOverhead] = useState(0)
    const [vendorName, setVendorName] = useState('')
    const [vendorNo, setVendorNo] = useState('')
    const [overheadRate, setOverheadRate] = useState(0)
    const [overheadCalc, setOverheadCalc] = useState(0)


    //variable to control changes to PO while loading
    const [updatePO, setUpdatePO] = useState(false)

    //variables to allow data entry to update purchase
    const [newTruckLine, setNewTruckLine] = useState(0)
    const [truckLineRef, setTruckLineFocus] = UseFocus()
    const [newDropLine, setNewDropLine] = useState(0)
    const [dropLineRef, setDropLineFocus] = UseFocus()
    const [delCheckbox, setDelCheckbox] = useState(false)
    const [delBoxRef, setDelBoxFocus] = UseFocus()
    const [newDelLine, setNewDelLine] = useState(0)
    const [delLineRef, setDelLineFocus] = UseFocus()
    const [newStorageLine, setNewStorageLine] = useState(0)
    const [storageLineRef, setStorageLineFocus] = UseFocus()
    const [showStorageCalcOptions, setShowStorageCalcOptions] = useState(false)
    const [lot, setLot] = useState(0)
    const [lotRef, setLotFocus] = UseFocus()
    const [wtCase, setWtCase] = useState(0)
    const [wtCaseRef, setWtCaseFocus] = UseFocus()
    const [lotValue, setLotValue] = useState(0)
    const [lotValueRef, setLotValueFocus] = UseFocus()
    const [other, setOther] = useState(0)
    const [otherRef, setOtherFocus] = UseFocus()

    //variables for purchase order no and confirm po
    const [poNo, setPoNo] = useState('')
    const [poNORef, setpoNOFocus] = UseFocus()
    const [poConfirm, setpoConfirm_] = useState(false)
    const poConfirmRef = useRef(poConfirm)

    //Function to change PO Confirm
    const setpoConfirm = d => {
        poConfirmRef.current = d
        setpoConfirm_(d)
    }

    //Funtion to confirm PO when * key pressed
    useEffect(() => {
        if (props.activeTab == "1") {
            if (props.keyCode.key === 106) {
                setpoConfirm(!poConfirmRef.current)
                setpoNOFocus()
            }
        }
    }, [props.activeTab, props.keyCode])

    //Function to update data when PO confirmed/unconfirmed
    useEffect(() => {
        if (updatePO) {
            confirmPO()
        }
    }, [poConfirm])

    //clear when the page loads
    useEffect(() => {
        if (props.receipts.selectedReceipt === null && poNo === '') {
            props.dispatch(Actions.purchase([]))
            props.dispatch(Actions.selectedReceipt(null))
        }
    }, [])

    //Trigger to load purchases when a purchase order number is entered
    useEffect(() => {
        if (props.receipts.selectedReceipt !== null) {
            props.dispatch(Actions.selectedReceipt(null))
        }
        if (poNo !== '') {
            setUpdatePO(false)
            props.dispatch(Actions.updatePurchase(false))
            props.dispatch(Actions.selectedPurchaseLine(null))
            props.dispatch(Actions.selectedRowIndex(null))
            props.dispatch(Actions.selectedClmnIndex(null))
            props.dispatch(Actions.purchase([]))
            const timeoutId = setTimeout(() => getPurchase(), 100);
            return () => clearTimeout(timeoutId);
        }
    }, [poNo])

    //Trigger to load purchase when a receipt is selected in the Receipts Grid
    useEffect(() => {
        setUpdatePO(false)
        if (props.receipts.selectedReceipt !== null) {
            if (props.receipts.selectedReceipt['PO Ver\'d']) {
                setpoConfirm(props.receipts.selectedReceipt['PO Ver\'d'])
            } else {
                setpoConfirm(false)
            }
            props.dispatch(Actions.updatePurchase(false))
            props.dispatch(Actions.selectedPurchaseLine(null))
            props.dispatch(Actions.selectedRowIndex(0))
            props.dispatch(Actions.selectedClmnIndex(12))
            getPurchase()
        }
    }, [props.receipts.selectedReceipt])

    //function to create table headers and calculate totals
    useEffect(() => {
        if (props.purchase.purchase) {
            if (props.purchase.purchase !== undefined) {
                if (props.purchase.purchase.length > 0) {
                    setUpdatePO(true)
                    props.dispatch(Actions.updatePurchase(false))
                    props.dispatch(Actions.purchaseHeaders(CreateHeaders(headerParams, props.purchase.purchase[0])))
                    let wgt = 0, oh = 0, tl = 0, dl = 0, dell = 0, sl = 0, aoh = 0, dbtn = 1
                    let updateDelDbtn = true
                    for (let index = 0; index < props.purchase.purchase.length; index++) {
                        const element = props.purchase.purchase[index]
                        wgt += element.Weight
                        oh += element['Over Head']
                        tl += element['Truck Line']
                        dl += element['Drop Line']
                        dell += element['Del Line']
                        sl += element['Storage Line']
                        aoh += element['Act OH']
                        dbtn = dbtn * element['Del Dtbn']
                        if (element['Del Dtbn']) { updateDelDbtn = false }
                    }
                    if (updateDelDbtn) {
                        for (let index = 0; index < props.purchase.purchase.length; index++) {
                            const element = props.purchase.purchase[index]
                            // runUpdate(element, 'DelDtbn', '0')
                        }
                    }
                    setWeight(wgt.toFixed(2))
                    setOverhead(oh.toFixed(2))
                    setTruckLine(tl.toFixed(2))
                    setDropLine(dl.toFixed(2))
                    setDelLine(dell.toFixed(2))
                    setStorageLine(sl.toFixed(2))
                    setActOverhead(aoh.toFixed(2))
                    setDelCheckbox(dbtn)
                    isPOConfirmed()

                    if (props.purchase.selectedPurchaseLine === null || props.purchase.selectedPurchaseLine === undefined) {
                        props.dispatch(Actions.selectedRowIndex(0))
                        props.dispatch(Actions.selectedClmnIndex(12))
                        let whsInfo
                        if (props.whsDefaults.whsDefaults !== null) {
                            for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                                if (props.whsDefaults.whsDefaults[index].Whs === props.purchase.purchase[0].whs) {
                                    whsInfo = props.whsDefaults.whsDefaults[index]
                                    setWtCase(whsInfo.TallyCost)
                                    setLotValue(whsInfo.ReleaseCost)
                                }
                            }
                        } else {
                            setWtCase(props.defaults.defaultWtCase)
                            setLotValue(props.defaults.defaultLotValue)
                        }
                        setLot(props.defaults.defaultLot)
                        setOther(props.defaults.defaultOther)
                    }

                } else {
                    setWeight(0)
                    setOverhead(0)
                    setTruckLine(0)
                    setDropLine(0)
                    setDelLine(0)
                    setStorageLine(0)
                    setActOverhead(0)
                    setDelCheckbox(false)
                    props.dispatch(Actions.tempDefaultLot(props.defaults.defaultLot))
                    props.dispatch(Actions.tempDefaultWtCase(props.defaults.defaultWtCase))
                    props.dispatch(Actions.tempDefaultLotValue(props.defaults.defaultLotValue))
                    props.dispatch(Actions.tempDefaultOther(props.defaults.defaultOther))
                }
            } else {
                setWeight(0)
                setOverhead(0)
                setTruckLine(0)
                setDropLine(0)
                setDelLine(0)
                setStorageLine(0)
                setActOverhead(0)
                setDelCheckbox(false)
                props.dispatch(Actions.tempDefaultLot(props.defaults.defaultLot))
                props.dispatch(Actions.tempDefaultWtCase(props.defaults.defaultWtCase))
                props.dispatch(Actions.tempDefaultLotValue(props.defaults.defaultLotValue))
                props.dispatch(Actions.tempDefaultOther(props.defaults.defaultOther))
            }
        } else {
            setWeight(0)
            setOverhead(0)
            setTruckLine(0)
            setDropLine(0)
            setDelLine(0)
            setStorageLine(0)
            setActOverhead(0)
            setDelCheckbox(false)
            props.dispatch(Actions.tempDefaultLot(props.defaults.defaultLot))
            props.dispatch(Actions.tempDefaultWtCase(props.defaults.defaultWtCase))
            props.dispatch(Actions.tempDefaultLotValue(props.defaults.defaultLotValue))
            props.dispatch(Actions.tempDefaultOther(props.defaults.defaultOther))
        }
    }, [JSON.stringify(props.purchase.purchase), props.purchase.purchase, JSON.stringify(headerParams)])

    //Select first record by default
    useEffect(() => {
        if (props.purchase.purchase !== undefined || props.purchase.purchase !== null) {
            if (props.purchase.purchase.length > 0) {
                if (props.purchase.selectedPurchaseLine === null || props.purchase.selectedPurchaseLine === undefined) {
                    props.dispatch(Actions.selectedPurchaseLine(props.purchase.purchase[props.purchase.selectedRowIndex]))
                }
            }
        }
    }, [props.purchase.purchase, props.purchase.purchase.length, props.purchase.selectedPurchaseLine])

    //Trigger to update grid post changes to purchase order
    useEffect(() => {
        if (props.purchase.updatePurchase) { getPurchase() }
    }, [props.purchase.updatePurchase])

    //update temporary defaults - Lot
    useEffect(() => {
        props.dispatch(Actions.tempDefaultLot(lot))
    }, [lot])

    //update temporary defaults - WtCase
    useEffect(() => {
        props.dispatch(Actions.tempDefaultWtCase(wtCase))
    }, [wtCase])

    //update temporary defaults - LotValue
    useEffect(() => {
        props.dispatch(Actions.tempDefaultLotValue(lotValue))
    }, [lotValue])

    //update temporary defaults - Other
    useEffect(() => {
        props.dispatch(Actions.tempDefaultOther(other))
    }, [other])

    //Move cursor to lot field
    useEffect(() => {
        if (showStorageCalcOptions) {
            setLotFocus()
        }
    }, [showStorageCalcOptions])

    //function to get purchase order info i.e., row index changed
    useEffect(() => {
        if (props.purchase.purchase !== null && props.purchase.purchase !== undefined &&
            props.purchase.purchase.length > 0) {
            if (props.purchase.selectedRowIndex !== null && props.purchase.selectedRowIndex !== undefined
                && props.purchase.purchase[props.purchase.selectedRowIndex] !== undefined) {
                props.dispatch(Actions.selectedPurchaseLine(props.purchase.purchase[props.purchase.selectedRowIndex]))
                const params = [
                    {
                        paramName: 'LotSerialNo',
                        paramType: 'varchar',
                        paramLength: 15,
                        paramValue: props.purchase.purchase[props.purchase.selectedRowIndex].LotSerialNo
                    },
                    {
                        paramName: 'ItemCode',
                        paramType: 'varchar',
                        paramLength: 30,
                        paramValue: props.purchase.purchase[props.purchase.selectedRowIndex].Product
                    },
                    {
                        paramName: 'Whs',
                        paramType: 'varchar',
                        paramLength: 3,
                        paramValue: props.purchase.purchase[props.purchase.selectedRowIndex].Whs
                    }
                ]
                Fetch('POST', '/commissionLotInfo', params, (data, err) => {
                    if (err) { setErrMsg(err) }
                    if (data.recordset && data.recordset[0] !== undefined) {
                        setAnnivDate(data.recordset[0].AnnivDate)
                        setReceiptDate(data.recordset[0].ReceiptDate)
                        setVendorName(data.recordset[0].VendorName)
                        setVendorNo(data.recordset[0].VendorNo)
                        setOverheadRate(data.recordset[0].OverheadExpRate)
                        setOverheadCalc(data.recordset[0].OverheadCalc)
                    } else {
                        setAnnivDate('')
                        setReceiptDate('')
                        setVendorName('')
                        setVendorNo('')
                        setOverheadRate(0)
                        setOverheadCalc(0)
                    }
                })

                let whsInfo
                let row = props.purchase.purchase[props.purchase.selectedRowIndex]
                if (props.whsDefaults.whsDefaults !== undefined) {
                    for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                        if (props.whsDefaults.whsDefaults[index].Whs === row.Whs) {
                            whsInfo = props.whsDefaults.whsDefaults[index]
                            break
                        }
                    }
                    setWtCase(whsInfo.TallyCost)
                    setLotValue(whsInfo.ReleaseCost)
                }
            } else {
                setAnnivDate('')
                setReceiptDate('')
                setVendorName('')
                setVendorNo('')
                setOverheadRate(0)
                setOverheadCalc(0)
            }
        }
    }, [props.purchase.selectedRowIndex, props.purchase.purchase])

    //function to trigger selection of data entry field
    useEffect(() => {
        if (props.purchase.purchase !== null) {
            if (props.purchase.purchase.length > 0 && props.purchase.purchaseHeaders !== null) {
                if (props.purchase.selectedClmnIndex !== null) { columnSelect(props.purchase.purchaseHeaders[props.purchase.selectedClmnIndex + 1]) }
            }
        }
    }, [props.purchase.selectedClmnIndex, props.purchase.purchase, props.purchase.purchaseHeaders])

    //function to fetch purchase from API server
    function getPurchase() {
        setShowStorageCalcOptions(false)
        let params = null
        if (props.receipts.selectedReceipt !== null) {
            params = [
                {
                    paramName: 'LotSerialNo',
                    paramType: 'varchar',
                    paramLength: 15,
                    paramValue: props.receipts.selectedReceipt.LotSerialNo
                },
                {
                    paramName: 'ItemCode',
                    paramType: 'varchar',
                    paramLength: 30,
                    paramValue: props.receipts.selectedReceipt.Product
                },
                {
                    paramName: 'Whs',
                    paramType: 'varchar',
                    paramLength: 3,
                    paramValue: props.receipts.selectedReceipt.Whs
                }
            ]
        } else {
            params = [
                {
                    paramName: 'PO',
                    paramType: 'varchar',
                    paramLength: 7,
                    paramValue: poNo
                }
            ]
        }
        Fetch('POST', '/commissionPurchases', params, response => {
            props.dispatch(Actions.purchase(response.recordset))
        })
    }

    //function to verify if PO is confirmed
    function isPOConfirmed() {
        if (props.purchase.purchase[0].LotSerialNo !== undefined) {
            let params = [
                {
                    paramName: 'Method',
                    paramType: 'varchar',
                    paramLength: 6,
                    paramValue: 'GET'
                },
                {
                    paramName: 'LotSerialNo',
                    paramType: 'varchar',
                    paramLength: 15,
                    paramValue: props.purchase.purchase[0].LotSerialNo
                },
                {
                    paramName: 'Confirm',
                    paramType: 'varchar',
                    paramLength: 1,
                    paramValue: null
                },
                {
                    paramName: 'RowsUpdated',
                    paramType: 'int',
                    paramValue: 0
                }
            ]
            Fetch('POST', '/commissionConfirmPO', params, (data, err) => {
                if (err) { setErrMsg(err) }
                if (data) {
                    if (data.recordset[0] !== undefined) {
                        setpoConfirm(data.recordset[0].Confirmed === 'Y' ? true : false)
                        if (data.recordset[0].Confirmed !== 'Y') { updateDropLine() }
                        else { setPoNo('') }
                    } else {
                        setpoConfirm(false)
                    }
                } else {
                    setpoConfirm(false)
                }
            })
        }
    }

    //function to automatically assign OH Calculation to Drop Line
    function updateDropLine() {
        let dpLine = 0
        for (let index = 0; index < props.purchase.purchase.length; index++) {
            const element = props.purchase.purchase[index]
            dpLine += element["Drop Line"]
        }
        if (dpLine === 0) {
            for (let index = 0; index < props.purchase.purchase.length; index++) {
                //console.log('Running Update for Lot Serial No ' + props.purchase.purchase[index].LotSerialNo)
                let row = props.purchase.purchase[index]
                let params = [
                    {
                        paramName: 'RecType',
                        paramType: 'varchar',
                        paramLength: 10,
                        paramValue: row.RecType
                    },
                    {
                        paramName: 'LotSerialNo',
                        paramType: 'varchar',
                        paramLength: 15,
                        paramValue: row.LotSerialNo
                    },
                    {
                        paramName: 'ItemCode',
                        paramType: 'varchar',
                        paramLength: 30,
                        paramValue: row.Product
                    },
                    {
                        paramName: 'WarehouseCode',
                        paramType: 'varchar',
                        paramLength: 3,
                        paramValue: row.Whs
                    },
                    {
                        paramName: 'ReceiptNo',
                        paramType: 'varchar',
                        paramLength: 6,
                        paramValue: row.Receiver
                    },
                    {
                        paramName: 'HeaderSeqNo',
                        paramType: 'varchar',
                        paramLength: 6,
                        paramValue: row.Seq
                    },
                    {
                        paramName: 'fieldName',
                        paramType: 'varchar',
                        paramLength: 20,
                        paramValue: 'DropLineAuto'
                    },
                    {
                        paramName: 'Value',
                        paramType: 'decimal',
                        paramPrecision: 19,
                        paramScale: 6,
                        paramValue: 0
                    },
                    {
                        paramName: 'Result',
                        paramType: 'int',
                        paramDirection: 'OUTPUT'
                    }
                ]
                let msg = ''
                //console.log(params)
                Fetch('POST', '/commissionUpdateRecExp', params, function (data, err) {
                    //console.log(data, err)
                    if (err !== undefined) { msg = err }
                    else {
                        if (data.output.Result > 0) {
                            if (index === props.purchase.purchase.length - 1) {
                                props.dispatch(Actions.updatePurchase(true))
                                //console.log('Drop Line updated!')
                            }
                        }
                    }
                })
            }
        }
    }

    //function to confirm or unconfirm PO
    function confirmPO() {
        if (props.purchase.purchase.length > 0 && updatePO) {
            for (let index = 0; index < props.purchase.purchase.length; index++) {
                const element = props.purchase.purchase[index];
                let params = [
                    {
                        paramName: 'LotSerialNo',
                        paramType: 'varchar',
                        paramLength: 15,
                        paramValue: element.LotSerialNo
                    },
                    {
                        paramName: 'Confirm',
                        paramType: 'varchar',
                        paramLength: 1,
                        paramValue: poConfirm ? 'Y' : 'N'
                    },
                    {
                        paramName: 'RowsUpdated',
                        paramType: 'int',
                        paramDirection: 'OUTPUT'
                    }
                ]
                //console.log(params)
                Fetch('POST', '/commissionConfirmPO', params, function (data, err) {
                    //console.log(data, err)
                    if (err !== undefined) { setErrMsg(err) }
                    else {
                        if (data.output.RowsUpdated > 0) {
                            props.dispatch(Actions.updateReceipts(true))
                        }
                    }
                })
            }
        }
    }

    //function to control data entry in purchase grid
    const keyDown = (e, field) => {
        let storageParams = ['Lot', 'WtCase', 'LotValue', 'Other']
        setShowAlert(false)
        switch (e.keyCode) {
            case 13:
                e.preventDefault()
                if (field === 'PONo') {
                    setUpdatePO(false)
                    props.dispatch(Actions.purchase([]))
                    props.dispatch(Actions.selectedReceipt(null))
                    getPurchase()
                } else if (storageParams.includes(field)) {
                    switch (field) {
                        case 'Lot':
                            setWtCaseFocus()
                            break
                        case 'WtCase':
                            verifyStorageCalcValues(field, e.target.value)
                            setLotValueFocus()
                            break
                        case 'LotValue':
                            verifyStorageCalcValues(field, e.target.value)
                            setOtherFocus()
                            break
                        case 'Other':
                            updateValues(field, e.target.value)
                            break
                    }
                } else if (field !== 'DelDtbn') {
                    if (e.target.value !== '') { updateValues(field, e.target.value) }
                    e.target.select()
                }
                break
            case 107:
                e.preventDefault()
                if (!storageParams.includes(field)) {
                    props.dispatch(Actions.selectedRowIndex(0))
                }
                switch (field) {
                    case 'Lot':
                        setWtCaseFocus()
                        break
                    case 'WtCase':
                        verifyStorageCalcValues(field, e.target.value)
                        setLotValueFocus()
                        break
                    case 'LotValue':
                        verifyStorageCalcValues(field, e.target.value)
                        setOtherFocus()
                        break
                    case 'Other':
                        setLotFocus()
                        break
                    case 'StorageLine':
                        props.dispatch(Actions.selectedClmnIndex(props.purchase.selectedClmnIndex - 4))
                        break
                    case 'DropLine':
                        props.dispatch(Actions.selectedClmnIndex(props.purchase.selectedClmnIndex + 2))
                        break
                    default:
                        props.dispatch(Actions.selectedClmnIndex(props.purchase.selectedClmnIndex + 1))
                        break
                }
                break
            case 109:
                if (field === 'StorageLine') {
                    e.preventDefault()
                    setShowStorageCalcOptions(true)
                }
                break
            case 32:
                e.preventDefault()
                if (field === 'DelLine') {
                    let row = props.purchase.selectedPurchaseLine
                    let msg = runUpdate(row, 'DelDtbn', (!row['Del Dtbn'] ? 1 : 0))
                    setErrMsg(msg)
                    setDelCheckbox(false)
                } else if (field === 'DelDtbn') {
                    updateValues(field, e.target.value)
                }
                break
            case 38:
                e.preventDefault()
                if (props.purchase.selectedRowIndex > 0) {
                    props.dispatch(Actions.selectedRowIndex(props.purchase.selectedRowIndex - 1))
                }
                break
            case 40:
                e.preventDefault()
                if (props.purchase.purchase.length > props.purchase.selectedRowIndex + 1) {
                    props.dispatch(Actions.selectedRowIndex(props.purchase.selectedRowIndex + 1))
                }
                break
            case 106:
                e.preventDefault()
                break
            default:
                break
        }
    }

    //function to verify values entered for calculating storage overhead
    function verifyStorageCalcValues(field, value) {
        if (props.purchase.purchase !== null && props.purchase.selectedPurchaseLine !== null) {
            let whsInfo
            let row = props.purchase.selectedPurchaseLine
            let msg = ''
            switch (field) {
                case 'WtCase':
                    if (props.whsDefaults.whsDefaults !== null) {
                        for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                            if (props.whsDefaults.whsDefaults[index].Whs === row.Whs) {
                                whsInfo = props.whsDefaults.whsDefaults[index]
                            }
                        }
                    }
                    let wtCaseValue = value
                    if (wtCaseValue === '') { wtCaseValue = 0 }
                    if (wtCaseValue > props.defaults.defaultTally) {
                        msg = 'Wt/Case cannot be set higher than ' + props.defaults.defaultTally
                        wtCaseValue = props.defaults.defaultTally
                        setWtCase(wtCaseValue)
                    }
                    break
                case 'LotValue':
                    if (props.whsDefaults.whsDefaults !== null) {
                        for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                            if (props.whsDefaults.whsDefaults[index].Whs === row.Whs) {
                                whsInfo = props.whsDefaults.whsDefaults[index]
                            }
                        }
                    }
                    let lotValueValue = value
                    if (lotValueValue > (whsInfo.ReleaseCost > 0 ? whsInfo.ReleaseCost : props.defaults.defaultRelease)) {
                        msg = 'Release cannot be set higher than ' + (whsInfo.ReleaseCost > 0 ? whsInfo.ReleaseCost : props.defaults.defaultRelease)
                        lotValueValue = (whsInfo.ReleaseCost > 0 ? whsInfo.ReleaseCost : props.defaults.defaultRelease)
                    }
                    setLotValue(lotValueValue)
                    break
                default:
                    msg = ''
                    break
            }
            setErrMsg(msg)
        }
    }

    //function to select data entry field when certain column is selected on Purchase order grid
    const columnSelect = (column) => {
        if (!poConfirm) {
            switch (column.dataField) {
                case 'Truck Line':
                    setTruckLineFocus()
                    break
                case 'Drop Line':
                    setDropLineFocus()
                    break
                case 'Del Dtbn':
                    setDelBoxFocus()
                    break
                case 'Del Line':
                    setDelLineFocus()
                    break
                case 'Storage Line':
                    setStorageLineFocus()
                    break
                default:
                    break;
            }
        }
    }

    //function to create update overhead trigger for purchase grid
    function updateValues(field, value) {
        //console.log(field, value)
        if (props.purchase.purchase !== null && props.purchase.selectedPurchaseLine !== null) {
            let row = props.purchase.selectedPurchaseLine
            let msg = '', fetchResult = ''
            switch (field) {
                case 'TruckLine':
                    //if (value === '') { value = 0 }
                    for (let i = 0; i < props.purchase.purchase.length; i++) {
                        let row = props.purchase.purchase[i]
                        let truckValue = parseFloat(((value / weight) * row.Weight).toFixed(4))
                        // console.log(value, weight, row.Weight, truckValue, props.defaults.defaultTruck)
                        if (truckValue > props.defaults.defaultTruck) {
                            if (msg === '') {
                                msg = 'Truck Charge can not be over ' + props.defaults.defaultTruck + ' and has been reset to maximun for lot ' + row.LotSerialNo
                            } else {
                                msg += '\n Truck Charge can not be over ' + props.defaults.defaultTruck + ' and has been reset to maximun for lot ' + row.LotSerialNo
                            }
                            truckValue = props.defaults.defaultTruck
                        }
                        fetchResult = runUpdate(row, field, truckValue)
                        msg = msg === '' ? fetchResult : msg + '\n' + fetchResult
                    }
                    setNewTruckLine('')
                    break
                case 'DropLine':
                    let dropValue = value
                    if (value === '' || value === '0') { dropValue = overheadCalc }
                    msg = runUpdate(row, field, dropValue)
                    setNewDropLine('')
                    break
                case 'DelDtbn':
                    for (let i = 0; i < props.purchase.purchase.length; i++) {
                        let row = props.purchase.purchase[i]
                        let delDtbnValue = row['Del Dbtn'] ? 1 : 0
                        fetchResult = runUpdate(row, field, delDtbnValue)
                        msg = msg === '' ? fetchResult : msg + '\n' + fetchResult
                    }
                    setDelCheckbox(false)
                    break
                case 'DelLine':
                    let delValue = value
                    let delWgt = 0
                    if (row['Del Dtbn']) {
                        for (let i = 0; i < props.purchase.purchase.length; i++) {
                            row = props.purchase.purchase[i]
                            if (row['Del Dtbn']) {
                                delWgt += row.Weight
                            }
                        }
                        for (let i = 0; i < props.purchase.purchase.length; i++) {
                            row = props.purchase.purchase[i]
                            if (row['Del Dtbn']) {
                                delValue = (row.Weight * value) / delWgt
                                fetchResult = runUpdate(row, field, delValue)
                                msg = msg === '' ? fetchResult : msg + '\n' + fetchResult
                            }
                        }
                    } else {
                        msg = runUpdate(row, field, delValue)
                    }
                    setNewDelLine('')
                    break
                case 'StorageLine':
                    let storageValue = value
                    msg = runUpdate(row, field, storageValue)
                    setNewStorageLine('')
                    break
                case 'Lot':
                case 'WtCase':
                case 'LotValue':
                case 'Other':
                    let wtCaseTot = (wtCase * row.Cases)
                    if (wtCase != 0) {
                        let whsInfo
                        if (props.whsDefaults.whsDefaults !== undefined) {
                            for (let index = 0; index < props.whsDefaults.whsDefaults.length; index++) {
                                if (props.whsDefaults.whsDefaults[index].Whs === row.Whs) {
                                    whsInfo = props.whsDefaults.whsDefaults[index]
                                    break
                                }
                            }
                        }
                        if (wtCaseTot < whsInfo.TallyMin) {
                            setErrMsg('Tally charge for the warehouse ' + props.purchase.selectedPurchaseLine.whs + ' cannot be less than ' + whsInfo.TallyMin)
                            wtCaseTot = whsInfo.TallyMin
                        }
                    }
                    let calcStorageValue = (lot * row.Weight) + wtCaseTot + Number(lotValue) + Number(other)
                    // console.log(lot, row.Weight, wtCase, row.Cases, lotValue, other, (lot * row.Weight), (wtCase * row.Cases), (lot * row.Weight) + (wtCase * row.Cases), calcStorageValue)
                    msg = runUpdate(row, 'StorageLine', calcStorageValue)
                    setNewStorageLine('')
                    setStorageLineFocus()
                    break
                default:
                    msg = field + ' not defined'
                    break
            }
            setErrMsg(msg)
            msg = ''
        }
    }

    //function to update overhead for purchase grid
    function runUpdate(row, field, value) {
        let params = [
            {
                paramName: 'RecType',
                paramType: 'varchar',
                paramLength: 10,
                paramValue: row.RecType
            },
            {
                paramName: 'LotSerialNo',
                paramType: 'varchar',
                paramLength: 15,
                paramValue: row.LotSerialNo
            },
            {
                paramName: 'ItemCode',
                paramType: 'varchar',
                paramLength: 30,
                paramValue: row.Product
            },
            {
                paramName: 'WarehouseCode',
                paramType: 'varchar',
                paramLength: 3,
                paramValue: row.Whs
            },
            {
                paramName: 'ReceiptNo',
                paramType: 'varchar',
                paramLength: 6,
                paramValue: row.Receiver
            },
            {
                paramName: 'HeaderSeqNo',
                paramType: 'varchar',
                paramLength: 6,
                paramValue: row.Seq
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
        let msg = ''
        // console.log(params)
        Fetch('POST', '/commissionUpdateRecExp', params, function (data, err) {
            // console.log(data, err)
            if (err !== undefined) { msg = err }
            else {
                if (data.output !== undefined) {
                    if (data.output.Result > 0) {
                        props.dispatch(Actions.updatePurchase(true))
                        if (props.purchase.purchase.length > props.purchase.selectedRowIndex + 1) {
                            props.dispatch(Actions.selectedRowIndex(props.purchase.selectedRowIndex + 1))
                        }
                    }
                }
            }
        })
        return (msg)
    }

    //function to set background color for Over head total
    function setStyle() {
        if (overhead === actOverhead) {
            return {
                textAlign: 'right',
                width: '60px',
                backgroundColor: 'lightgreen'
            }
        } else {
            return {
                textAlign: 'right',
                width: '60px'
            }
        }
    }

    return (
        <div>
            <Row>
                <Col style={{ paddingLeft: '15px' }} xs='1150px'>
                    <div className='SmallGridSize'>
                        <Table
                            id='Purchases'
                            activeTab={props.activeTab}
                            selectRow={row => { props.dispatch(Actions.selectedPurchaseLine(row)) }}
                            rowIndex={rowIndex => { props.dispatch(Actions.selectedRowIndex(rowIndex)) }}
                        />
                    </div>
                </Col>
                <Col>
                    <Label style={{ textAlign: 'center' }}>Purchase Order No</Label>
                    <input type='text' ref={poNORef} style={{ textAlign: 'center', marginLeft: '1px', width: '80px' }} value={poNo}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setPoNo(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'PONo')}
                    />
                    <br />
                    <input type='checkbox' name='po_confirm' checked={poConfirm} onChange={() => { console.log(poConfirm) }} />PO Confirm
                </Col>
            </Row>
            <div className='purchaseInfo'>
                <div>
                    <Label for='AnniversaryDate'>Anniversary Date: </Label>{'  '}
                    <input id='AnniversaryDate' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={annivDate} />
                    <Label for='ReceiptDate' style={{ marginLeft: '10px' }}>Receipt Date:</Label>
                    <input id='ReceiptDate' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={receiptDate} />
                    {props.purchase.purchase !== null && props.purchase.purchase.length < 4 && <Label style={{ width: '15px' }} />}
                    <input type='text' readOnly style={{ textAlign: 'right', marginLeft: '177px', width: '60px' }} value={weight} />
                    <Label style={{ width: '50px' }} />
                    <input type='text' readOnly style={setStyle()} value={overhead} />
                    <input type='text' readOnly style={{ textAlign: 'right', marginLeft: '49px', width: '60px' }} value={truckLine} />
                    <input type='text' readOnly style={{ textAlign: 'right', width: '60px' }} value={dropLine} />
                    <input type='text' readOnly style={{ textAlign: 'right', marginLeft: '34px', width: '60px' }} value={delLine} />
                    <input type='text' readOnly style={{ textAlign: 'right', width: '60px' }} value={storageLine} />
                    <input type='text' readOnly style={setStyle()} value={actOverhead} />
                    <br />
                </div>
                <div>
                    <Label for='Vendor'>Vendor:</Label>{' '}
                    <input id='Vendor' type='text' readOnly style={{ marginLeft: '45px', width: '190px' }} value={vendorName} />
                    <input type='text' readOnly style={{ marginLeft: '2px', width: '60px' }} value={vendorNo} />
                    {props.purchase.purchase !== null && props.purchase.purchase.length < 4 && <Label style={{ width: '15px' }} />}
                    <Label for='OverheadRate' style={{ marginLeft: '74px' }}>OH Rate:</Label>
                    <input id='OverheadRate' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={overheadRate} />
                    <Label for='OHCalc' style={{ marginLeft: '10px' }} >OH Calc:</Label>
                    <input id='OHCalc' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={overheadCalc} />
                    <input type='number' ref={truckLineRef} style={{ textAlign: 'right', marginLeft: '49px', width: '60px' }} value={newTruckLine}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewTruckLine(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'TruckLine')}
                        hidden={poConfirm} />
                    <input type='number' ref={dropLineRef} style={{ textAlign: 'right', width: '60px' }} value={newDropLine}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewDropLine(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'DropLine')}
                        hidden={poConfirm} />
                    <input type="checkbox" ref={delBoxRef} style={{ width: '34px' }} checked={delCheckbox}
                        onChange={() => { setDelCheckbox(!delCheckbox) }}
                        onKeyDown={(e) => keyDown(e, 'DelDtbn')}
                        hidden={poConfirm} />
                    <input type='number' ref={delLineRef} style={{ textAlign: 'right', width: '60px' }} value={newDelLine}
                        onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewDelLine(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'DelLine')}
                        hidden={poConfirm} />
                    <input type='number' ref={storageLineRef} style={{ textAlign: 'right', width: '60px' }} value={newStorageLine}
                        onFocus={(e) => { e.target.select(); setShowStorageCalcOptions(false); e.target.style.backgroundColor = 'lightblue' }}
                        onBlur={(e) => e.target.style.backgroundColor = 'white'}
                        onChange={(e) => setNewStorageLine(e.target.value)}
                        onKeyDown={(e) => keyDown(e, 'StorageLine')}
                        hidden={poConfirm} />
                    <br />
                </div>
            </div>
            <div>
                <label style={{ marginLeft: '1050px', textAlign: 'center', width: '60px' }} hidden={!showStorageCalcOptions} >Lot</label>
                <label style={{ textAlign: 'center', width: '60px' }} hidden={!showStorageCalcOptions} >Wt/Case</label>
                <label style={{ textAlign: 'center', width: '60px' }} hidden={!showStorageCalcOptions} >Lot</label>
                <label style={{ textAlign: 'center', width: '60px' }} hidden={!showStorageCalcOptions} >Other</label>
                <br />
                <input type='number' ref={lotRef} style={{ textAlign: 'right', width: '60px', marginLeft: '1050px' }} value={lot}
                    onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                    onBlur={(e) => e.target.style.backgroundColor = 'white'}
                    onChange={(e) => setLot(e.target.value)}
                    onKeyDown={(e) => keyDown(e, 'Lot')}
                    hidden={!showStorageCalcOptions}
                />
                <input type='number' ref={wtCaseRef} style={{ textAlign: 'right', width: '60px' }} value={wtCase}
                    onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                    onBlur={(e) => e.target.style.backgroundColor = 'white'}
                    onChange={(e) => setWtCase(e.target.value)}
                    onKeyDown={(e) => keyDown(e, 'WtCase')}
                    hidden={!showStorageCalcOptions}
                />
                <input type='number' ref={lotValueRef} style={{ textAlign: 'right', width: '60px' }} value={lotValue}
                    onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                    onBlur={(e) => e.target.style.backgroundColor = 'white'}
                    onChange={(e) => setLotValue(e.target.value)}
                    onKeyDown={(e) => keyDown(e, 'LotValue')}
                    hidden={!showStorageCalcOptions}
                />
                <input type='number' ref={otherRef} style={{ textAlign: 'right', width: '60px' }} value={other}
                    onFocus={(e) => { e.target.select(); e.target.style.backgroundColor = 'lightblue' }}
                    onBlur={(e) => e.target.style.backgroundColor = 'white'}
                    onChange={(e) => setOther(e.target.value)}
                    onKeyDown={(e) => keyDown(e, 'Other')}
                    hidden={!showStorageCalcOptions}
                />
            </div>
            <Alert color='danger' isOpen={showAlert} toggle={() => setShowAlert(false)}>
                {errMsg}
            </Alert>
        </div>
    )
}

Purchases.defaultProps = {

}

const mapStateToProps = ({ purchase, receipts, defaults, whsDefaults }) => ({ purchase, receipts, defaults, whsDefaults })
export default connect(mapStateToProps)(Purchases)