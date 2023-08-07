//import npm functions
import { useState, useEffect } from 'react'
import { connect } from "react-redux"
import { Form, Label, Input, Card, CardHeader, FormGroup, Alert, Button } from 'reactstrap'

//import custom functions
import Actions from '../Redux/Actions'
import Fetch from '../Functions/Fetch'
import CreateHeaders from '../Functions/CreateHeaders'
import { formatDate } from '../Functions/DateFunc'
import { baseURL } from '../Config'

//import custom components
import Table from './Table'

function Defaults(props) {
    //variables to store err messages and dispaly to the users
    const [alert, setAlert] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [err, setErr] = useState(0)
    const onDismiss = () => setShowAlert(false)

    //Function to update app defaults
    function commissionDefaults() {
        const params = [
            {
                paramName: 'Method',
                paramType: 'varchar',
                paramLength: 6,
                paramValue: 'UPDATE'
            },
            {
                paramName: 'disableInvConf',
                paramType: 'varchar',
                paramLength: 1,
                paramValue: (props.defaults.disableInvoiceConfirm ? 'Y' : 'N')
            },
            {
                paramName: 'invConfirm',
                paramType: 'varchar',
                paramLength: 1,
                paramValue: (props.defaults.enableInvoiceUnconfirm ? 'Y' : 'N')
            },
            {
                paramName: 'lot',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultLot
            },
            {
                paramName: 'wtCase',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultWtCase
            },
            {
                paramName: 'lotValue',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultLotValue
            },
            {
                paramName: 'other',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultOther
            },
            {
                paramName: 'release',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultRelease
            },
            {
                paramName: 'tally',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultTally
            },
            {
                paramName: 'truck',
                paramType: 'decimal',
                paramPrecision: 19,
                paramScale: 6,
                paramValue: props.defaults.defaultTruck
            }
        ]
        Fetch('POST', '/commissionDefaults', params, (data, err) => {
            if (err) {
                setErr(1)
                setAlert(err)
            } else {
                if (data.recordset) {
                    setErr(0)
                    setAlert('Update successful!')
                }
            }
        })
    }

    //Set Color for Alert box
    function setColor() {
        if (err === 1) { return 'danger' }
        else { return 'success' }
    }

    // When Tab loads
    useEffect(() => {
        if (props.activeTab != 2) {
            props.dispatch(Actions.invoice([]))
        }
    }, [props.activeTab])

    //Get app defaults and warehouse defaults
    useEffect(() => {
        if (props.whsDefaults.whsDefaults === null) {
            Fetch('POST', '/pCommissionsWhsDefaults', null, (data, err) => {
                if (err) {
                    setErr(1)
                    setAlert(err)
                } else {
                    props.dispatch(Actions.whsDefaults(data.recordset))
                    setErr(0)
                }
            })
            const params = [
                {
                    paramName: 'Method',
                    paramType: 'varchar',
                    paramLength: 6,
                    paramValue: 'GET'
                }
            ]
            Fetch('POST', '/commissionDefaults', params, (data, err) => {
                // console.log(data, err)
                if (err) {
                    setErr(1)
                    setAlert(err)
                } else if (data.recordset[0] !== undefined) {
                    setErr(0)
                    props.dispatch(Actions.disableInvoiceConfirm((data.recordset[0].DisableInvConf === 'Y') ? true : false))
                    props.dispatch(Actions.enableInvoiceUnconfirm((data.recordset[0].EnableInvUnconf === 'Y') ? true : false))
                    props.dispatch(Actions.defaultLot(data.recordset[0].Lot.toFixed(4)))
                    props.dispatch(Actions.defaultWtCase(data.recordset[0].WtCase.toFixed(2)))
                    props.dispatch(Actions.defaultLotValue(data.recordset[0].LotValue.toFixed(2)))
                    props.dispatch(Actions.defaultOther(data.recordset[0].Other.toFixed(2)))
                    props.dispatch(Actions.defaultRelease(data.recordset[0].Release.toFixed(2)))
                    props.dispatch(Actions.defaultTally(data.recordset[0].Tally.toFixed(2)))
                    props.dispatch(Actions.defaultTruck(data.recordset[0].Truck.toFixed(2)))
                }
            })
        }
    }, [JSON.stringify(props)])

    //Trigger to create table headers
    useEffect(() => {
        if (props.whsDefaults.whsDefaults !== null) {
            if (props.whsDefaults.whsDefaults[0] !== undefined) {
                props.dispatch(Actions.whsHeaders(CreateHeaders(props.headerParams, props.whsDefaults.whsDefaults[0])))
            }
        }
    }, [props.whsDefaults.whsDefaults, props.headerParams])

    //Trigger to display error message
    useEffect(() => {
        if (alert === '') {
            setShowAlert(false)
        } else {
            setShowAlert(true)
        }
    }, [alert])

    async function onBtnExport() {
        let url = baseURL + '/report/' + formatDate(props.receipts.fromDate) + '?' + formatDate(props.receipts.toDate)
        window.open(url, '_blank')
    }

    return (
        <div>
            <Form>
                <Card style={{ width: '600px' }}>
                    <CardHeader>Options</CardHeader>
                    <br />
                    <FormGroup className='form-inline'>
                        <Label for='inv_confirm' style={{ marginLeft: '1em' }}>Disable Inovice Confirm when PO is unconfirmed</Label>
                        <Input type='checkbox' id='inv_confirm' style={{ marginLeft: '2px' }}
                            checked={props.defaults.disableInvoiceConfirm}
                            onChange={() => props.dispatch(Actions.disableInvoiceConfirm(!props.defaults.disableInvoiceConfirm))}
                        />
                    </FormGroup>
                    <FormGroup className='form-inline'>
                        <Label for='inv_inconfirm' style={{ marginLeft: '1em' }}>Enable Invoice Unconfirm</Label>
                        <Input type='checkbox' id='inv_unconfirm' style={{ marginLeft: '2px' }}
                            checked={props.defaults.enableInvoiceUnconfirm}
                            onChange={() => props.dispatch(Actions.enableInvoiceUnconfirm(!props.defaults.enableInvoiceUnconfirm))}
                        />
                    </FormGroup>
                    <FormGroup className='form-inline'>
                        <Label style={{ marginLeft: '4em' }} >Lot</Label>
                        <Label style={{ marginLeft: '5em' }} >Wt/Case</Label>
                        <Label style={{ marginLeft: '5.5em' }} >Lot</Label>
                        <Label style={{ marginLeft: '6em' }} >Other</Label>
                        <Label style={{ marginLeft: '4.5em' }} >Release(Inv)</Label>
                        <Label style={{ marginLeft: '3em' }} >Tally(Inv)</Label>
                        <Label style={{ marginLeft: '5em' }} >Truck</Label>
                    </FormGroup>
                    <FormGroup className='form-inline'>
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.0000' value={props.defaults.defaultLot}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultLot(e.target.value))}
                        />
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.00' value={props.defaults.defaultWtCase}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultWtCase(e.target.value))}
                        />
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.00' value={props.defaults.defaultLotValue}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultLotValue(e.target.value))}
                        />
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.00' value={props.defaults.defaultOther}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultOther(e.target.value))}
                        />
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.00' value={props.defaults.defaultRelease}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultRelease(e.target.value))}
                        />
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.00' value={props.defaults.defaultTally}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultTally(e.target.value))}
                        />
                        <input type='number' style={{ textAlign: 'right', width: '7em', marginLeft: '1em' }}
                            placeholder='0.00' value={props.defaults.defaultTruck}
                            onFocus={(e) => e.target.select()} onChange={(e) => props.dispatch(Actions.defaultTruck(e.target.value))}
                        />
                    </FormGroup>
                    <button onClick={() => commissionDefaults()} style={{ width: '7em', marginLeft: '1em' }}>Update</button>
                </Card>
            </Form>
            <br />
            <Alert color={setColor()} isOpen={showAlert} toggle={onDismiss} fade={true}>
                {alert}
            </Alert>
            <br />
            <Button onClick={() => { onBtnExport() }}>Commissions Report</Button>
            <div className='WhsGrid'>
                <Table id='WhsDefaults' activeTab={props.activeTab} />
            </div>
        </div>
    )

}
Defaults.defaultProps = {

}

const mapStateToProps = ({ defaults, whsDefaults, receipts, invoice }) => ({ defaults, whsDefaults, receipts, invoice })
export default connect(mapStateToProps)(Defaults)