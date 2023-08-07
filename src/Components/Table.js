//import npm functions
import React, { useState, useEffect, useCallback, useReducer } from 'react'
import { Alert } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import { connect } from 'react-redux'

function Table(props) {
    const [showTable, setShowTable] = useState(false)
    const [clmns, setClmns] = useState(null)
    const [data, setData] = useState([])
    const [keyField, setKeyField] = useState('')
    const [selectedRowIndex, setSelectedRowIndex] = useReducer(rowIndexReducer, null)
    const [selectedRow, setSelectedRow] = useState([])

    //Reducer for selecting row
    function rowIndexReducer(state, action) {
        if (action === null) {
            return 0
        }
        return action
    }

    //Trigger for data changes
    useEffect(() => {
        if (props.id === 'Receipts') {
            setReceipts()
        } else if (props.id === 'Purchases') {
            setPurchases()
        } else if (props.id === 'Invoice') {
            setInvoices()
        } else if (props.id === 'WhsDefaults') {
            setWhsDefaults()
        } else if (props.id === 'PurchasesView') {
            setPurchaseView()
        }
    }, [props])

    //Update data and headers for warehouse grid
    const setWhsDefaults = useCallback(() => {
        if (props.whsDefaults.whsDefaults !== null) {
            setClmns(props.whsDefaults.whsHeaders)
            setKeyField('Whs')
            setData(props.whsDefaults.whsDefaults)
            if (props.whsDefaults.whsHeaders && props.activeTab === '3') { setShowTable(true) }
            else { setShowTable(false) }
        } else {
            setData(null)
            setShowTable(false)
        }
    }, [props.activeTab])

    //Update data and headers for receipt grid
    const setReceipts = useCallback(()=>{
        if (props.receipts.receipts !== null) {
            setClmns(props.receipts.receiptHeaders)
            setKeyField('Key Field')
            setData(props.receipts.receipts)
            if (props.receipts.receiptHeaders && props.activeTab === '1') { setShowTable(true) }
            else { setShowTable(false) }
        } else {
            setData(null)
            setShowTable(false)
        }
    }, [props.receipts.receipts, props.receipts.receiptHeaders, props.activeTab])

    //Update data and headers for purchase grid
    const setPurchases = useCallback(()=>{
        if (props.purchase.purchase !== null) {
            setClmns(props.purchase.purchaseHeaders)
            setKeyField('Key Field')
            setData(props.purchase.purchase)
            if (props.purchase.purchase.length > 0 && props.activeTab === '1') { setShowTable(true) }
            else { setShowTable(false) }
        } else {
            setData(null)
            setShowTable(false)
        }
    }, [props.purchase.purchase, props.purchase.purchaseHeaders, props.activeTab])

    //Update data and header for Invoice grid
    const setInvoices = useCallback(()=>{
        if (props.invoice.invoice !== null) {
            setClmns(props.invoice.invoiceHeaders)
            setKeyField('Key Field')
            setData(props.invoice.invoice)
            if (props.invoice.invoiceHeaders && props.activeTab === '2') { setShowTable(true) }
            else { setShowTable(false) }
        } else {
            setData(null)
            setShowTable(false)
        }
    }, [props.invoice.invoice, props.invoice.invoiceHeaders, props.activeTab])

    //Update data and header for Purchase view grid
    const setPurchaseView = useCallback(()=>{
        if (props.purchaseView.purchaseView !== null) {
            setClmns(props.purchaseView.purchaseViewHeaders)
            setKeyField('Key Field')
            setData(props.purchaseView.purchaseView)
            if (props.purchaseView.purchaseViewHeaders && props.activeTab === '2') { setShowTable(true) }
            else { setShowTable(false) }
        } else {
            setData(null)
            setShowTable(false)
        }
    })

    //Set selected row when selected row index changes
    useEffect(() => {
        if (data !== null) {
            setSelectedRow(data[selectedRowIndex])
        }
    }, [data, selectedRowIndex])

    //Trigger purchase order row into view
    useEffect(()=>{
        if (props.id === 'Purchases') {
            setPurchaseRowIndex()
        }
    }, [props.id, props.purchase.selectedRowIndex])
    
    //Set purchase order row into view
    const setPurchaseRowIndex = useCallback(() => {
        if (props.purchase.purchase !== null) {
            if (props.purchase.purchase.length > 0) {
                setSelectedRowIndex(props.purchase.selectedRowIndex)
                const purchasedTableTrList = document.querySelectorAll('table#Purchases tbody tr');
                if (purchasedTableTrList) {
                    const selectedPurchasedTableTr = purchasedTableTrList[props.purchase.selectedRowIndex]
                    if (selectedPurchasedTableTr !== undefined) {
                        selectedPurchasedTableTr.scrollIntoView(false)
                    }
                }
            }
        }
    }, [props.purchase.purchase, props.purchase.selectedRowIndex])
    
    //Trigger Invoice row into view
    useEffect(()=>{
        if (props.id === 'Invoice') {
            setInvoiceRowIndex()
        }
    }, [props.id, props.invoice.invoiceRowIndex])
    
    //Set Invoice row into view
    const setInvoiceRowIndex = useCallback(() => {
        if (props.invoice.invoice !== null) {
            if (props.invoice.invoice.length > 0) {
                setSelectedRowIndex(props.invoice.invoiceRowIndex)
                const invoicedTableTrList = document.querySelectorAll('table#Invoice tbody tr');
                if (invoicedTableTrList) {
                    const selectedInvoicedTableTr = invoicedTableTrList[props.invoice.invoiceRowIndex]
                    if (selectedInvoicedTableTr !== undefined) {
                        // console.log(selectedInvoicedTableTr)
                        selectedInvoicedTableTr.scrollIntoView(false)
                    }
                }
            }
        }
    }, [props.invoice.invoice, props.invoice.invoiceRowIndex])

    //Trigger Purchase view row into view
    useEffect(()=>{
        if (props.id === 'PurchasesView') {
            setPurchaseViewRowIndex()
        }
    }, [props.id, props.purchaseView.selectedPurchaseViewLine])
    
    //Set Invoice row into view
    const setPurchaseViewRowIndex = useCallback(() => {
        if (props.purchaseView.purchaseView !== null && props.invoice.selectedInvoiceLine !== null) {
            if (props.purchaseView.purchaseView.length > 0) {
                let prvIndex = 0
                for (let i = 0; i < props.purchaseView.purchaseView.length; i++) {
                    if (props.purchaseView.purchaseView[i].LotSerialNo === props.invoice.lotNo &&
                        props.purchaseView.purchaseView[i].Product === props.invoice.selectedInvoiceLine.Product) {
                        prvIndex = i
                        break
                    }
                }
                setSelectedRowIndex(prvIndex)
                const prvTableTrList = document.querySelectorAll('table#PurchasesView tbody tr');
                if (prvTableTrList) {
                    const selectedprvTableTr = prvTableTrList[prvIndex]
                    // console.log(selectedprvTableTr)
                    if (selectedprvTableTr !== undefined) {
                        selectedprvTableTr.scrollIntoView(false)
                    }
                }
            }
        }
    }, [props.purchaseView.purchaseView, props.purchaseView.selectedPurchaseViewLine, props.invoice.lotNo])

    //html to display app defaults and warehouse defaults
    if (!showTable) {
        return (
            <Alert>No records to display</Alert>
        )
    }
    return (
        <div>
            <BootstrapTable
                id={props.id}
                keyField={keyField}
                columns={clmns}
                data={data}
                bootstrap4
                hover
                condensed
                selectRow={{
                    mode: 'radio',
                    clickToSelect: true,
                    selected: [selectedRow]
                }}
                rowEvents={{
                    onClick: (e, row, rowIndex) => {
                        setSelectedRowIndex(rowIndex)
                        if (props.selectRow) { props.selectRow(row) }
                        if (props.rowIndex) { props.rowIndex(rowIndex) }
                    }
                }}
                rowStyle={
                    (row, rowIndex) => {
                        if (rowIndex === selectedRowIndex) {
                            return { backgroundColor: '#f0c3af' }
                        }
                    }
                }
            />
        </div>
    )
}

Table.defaultProps = {

}
// const mapStateToProps = ({ defaults, whsDefaults, receipts, purchase, inovice, purchaseView }) => ({ defaults, whsDefaults, receipts, purchase, inovice, purchaseView })
// export default connect(mapStateToProps)(Table)

const mapStateToProps = ({ receipts, purchase, invoice, whsDefaults, purchaseView }) => ({ receipts, purchase, invoice, whsDefaults, purchaseView })
export default connect(mapStateToProps)(Table)