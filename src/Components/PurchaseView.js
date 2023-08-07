import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Alert, Row, Col, Label } from 'reactstrap'

//imports from custom fuctions
import Table from './Table'
import CreateHeaders from '../Functions/CreateHeaders'
import Actions from '../Redux/Actions'
import Fetch from '../Functions/Fetch'

function PurchasesView(props) {
    //parameters to create table headers
    const headerParams = {
        id: 'PurchasesView'
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

    //variables for confirmed po
    const [poConfirm, setpoConfirm] = useState(false)

    //Trigger to clear the Purchase View grid
    useEffect(()=>{
        if (props.invoice.invoice === null) {
            props.dispatch(Actions.purchaseView(null))
        }
    },[])

    //Trigger to load purchase when an invoice line is selected in the Invoice Grid
    useEffect(() => {
        if (props.invoice.lotNo !== '') {
            const params = [
                {
                    paramName: 'LotSerialNo',
                    paramType: 'varchar',
                    paramLength: 15,
                    paramValue: props.invoice.lotNo
                }
            ]
            Fetch('POST', '/commissionPurchases', params, response => {
                props.dispatch(Actions.purchaseView(response.recordset))
            })
        } else {
            props.dispatch(Actions.purchaseView(null))
        }
    }, [props.invoice.lotNo])

    //function to create table headers and calculate totals
    useEffect(() => {
        if (props.purchaseView.purchaseView) {
            if (props.purchaseView.purchaseView[0] !== undefined) {
                props.dispatch(Actions.purchaseViewHeaders(CreateHeaders(headerParams, props.purchaseView.purchaseView[0])))
                let wgt = 0, oh = 0, tl = 0, dl = 0, dell = 0, sl = 0, aoh = 0
                for (let index = 0; index < props.purchaseView.purchaseView.length; index++) {
                    const element = props.purchaseView.purchaseView[index]
                    wgt += element.Weight
                    oh += element['Over Head']
                    tl += element['Truck Line']
                    dl += element['Drop Line']
                    dell += element['Del Line']
                    sl += element['Storage Line']
                    aoh += element['Act OH']
                    if (element.LotSerialNo === props.invoice.lotNo) {
                        props.dispatch(Actions.selectedPurchaseViewLine(element))
                    }
                }

                setWeight(wgt.toFixed(2))
                setOverhead(oh.toFixed(2))
                setTruckLine(tl.toFixed(2))
                setDropLine(dl.toFixed(2))
                setDelLine(dell.toFixed(2))
                setStorageLine(sl.toFixed(2))
                setActOverhead(aoh.toFixed(2))

                isPOConfirmed()
                LotInfo()
            } else {
                setWeight(0)
                setOverhead(0)
                setTruckLine(0)
                setDropLine(0)
                setDelLine(0)
                setStorageLine(0)
                setActOverhead(0)
            }
        } else {
            setWeight(0)
            setOverhead(0)
            setTruckLine(0)
            setDropLine(0)
            setDelLine(0)
            setStorageLine(0)
            setActOverhead(0)
        }
    }, [props.purchaseView.purchaseView])

    //function to verify if PO is confirmed
    function isPOConfirmed() {
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
                paramValue: props.invoice.lotNo
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
                } else {
                    setpoConfirm(false)
                }
            } else {
                setpoConfirm(false)
            }
        })
    }

    //function to get purchase order info
    function LotInfo() {
        if (props.invoice.lotNo !== '') {
            const params = [
                {
                    paramName: 'LotSerialNo',
                    paramType: 'varchar',
                    paramLength: 15,
                    paramValue: props.invoice.lotNo
                }
            ]
            Fetch('POST', '/commissionLotInfo', params, (data, err) => {
                if (err) { setErrMsg(err) }
                if (data.recordset && data.recordset[0] !== undefined) {
                    setAnnivDate(data.recordset[0].AnnivDate)
                    setReceiptDate(data.recordset[0].ReceiptDate)
                    setVendorName(data.recordset[0].VendorName)
                    setVendorNo(data.recordset[0].VendorNo)
                    setOverheadRate(data.recordset[0].OverheadExpRate.toFixed(4))
                    setOverheadCalc(data.recordset[0].OverheadCalc.toFixed(2))
                } else {
                    setAnnivDate('')
                    setReceiptDate('')
                    setVendorName('')
                    setVendorNo('')
                    setOverheadRate(0)
                    setOverheadCalc(0)
                }
            })
        } else {
            setAnnivDate('')
            setReceiptDate('')
            setVendorName('')
            setVendorNo('')
            setOverheadRate(0)
            setOverheadCalc(0)
        }
    }

    //function to set background color for Over head total box
    function setStyle(){
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

    //html to create purchase grid
    return (
        <div>
            <Row>
                <Col style={{ paddingLeft: '15px' }} xs='1150px'>
                    <div className='PVGridSize'>
                        {
                            props.purchaseView.purchaseView !== null &&
                            <Table id='PurchasesView' activeTab={props.activeTab} 
                        />}
                    </div>
                </Col>
                <Col>
                    <input type='checkbox' name='po_confirm' checked={poConfirm} readOnly />PO Confirm
                </Col>
            </Row>
            <div className='purchaseInfo'>
                <div>
                    <Label for='AnniversaryDate'>Anniversary Date: </Label>{'  '}
                    <input id='ViewAnniversaryDate' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={annivDate} />
                    <Label for='ReceiptDate' style={{ marginLeft: '10px' }}>Receipt Date:</Label>
                    <input id='ViewReceiptDate' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={receiptDate} />
                    {props.purchaseView.purchaseView !== null && props.purchaseView.purchaseView.length < 4 && <Label style={{ width: '15px' }} />}
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
                    <input id='ViewVendor' type='text' readOnly style={{ marginLeft: '45px', width: '190px' }} value={vendorName} />
                    <input type='text' readOnly style={{ marginLeft: '2px', width: '60px' }} value={vendorNo} />
                    {props.purchaseView.purchaseView !== null && props.purchaseView.purchaseView.length < 4 && <Label style={{ width: '15px' }} />}
                    <Label for='OverheadRate' style={{ marginLeft: '74px' }}>OH Rate:</Label>
                    <input id='ViewOverheadRate' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={overheadRate} />
                    <Label for='OHCalc' style={{ marginLeft: '10px' }} >OH Calc:</Label>
                    <input id='ViewOHCalc' type='text' readOnly style={{ textAlign: 'right', marginLeft: '2px', width: '60px' }} value={overheadCalc} />
                </div>
            </div>
            <Alert color='danger' isOpen={showAlert} toggle={() => setShowAlert(false)}>
                {errMsg}
            </Alert>
        </div>
    )
}

PurchasesView.defaultProps = {

}
const mapStateToProps = ({ invoice, purchaseView }) => ({ invoice, purchaseView })
export default connect(mapStateToProps)(PurchasesView)