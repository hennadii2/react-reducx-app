//import npm functions
import React, { useState, useRef, useEffect } from 'react'
import { connect } from "react-redux"
import { TabContent, TabPane } from "reactstrap"

//import custom functions
import Actions from "../Redux/Actions"

//import component
import Tabs from './Tabs'
import Defaults from "./Defaults"
import Receipts from './Receipts'
import Purchases from './Purchases'
import Invoice from './Invoice'
import PurchasesView from './PurchaseView'

function Commissions(props) {
    //parameters to create whs defaults grid
    const whsParams = {
        id: 'WhsDefaults',
        rowId: 0,
        colId: 0
    }

    const [keyCode, setkeyCode_] = useState({ keycode: 0, updated: true })
    const keycodeRef = useRef(keyCode)
    const setkeyCode = d => {
        keycodeRef.current = d
        setkeyCode_(d)
    }

    // useEffect(() => {
    //     if (props.defaults.activeTab === null) {
    //         props.dispatch(Actions.activeTab('1'))
    //     }
    // }, [props])

    //Function to send * key to confirm/unconfirm
    useEffect(() => {
        document.onkeydown = function (e) {
            setkeyCode({ key: e.keyCode, updated: !keycodeRef.current.updated })
        }
        return () => {
            document.onkeydown = null
        }
    }, [])

    return (
        <div>
            <Tabs activeTab={props.defaults.activeTab} toggle={data => props.dispatch(Actions.activeTab(data))} />
            <TabContent activeTab={props.defaults.activeTab}>
                <TabPane tabId='1' style={{ padding: 15 }}>
                    <Receipts activeTab={props.defaults.activeTab} />
                    <br />
                    <Purchases activeTab={props.defaults.activeTab} keyCode={keyCode} />
                </TabPane>
                <TabPane tabId='2' style={{ padding: 15 }}>
                    <PurchasesView activeTab={props.defaults.activeTab} />
                    <br />
                    <Invoice activeTab={props.defaults.activeTab} keyCode={keyCode} />
                </TabPane>
                <TabPane tabId='3' style={{ padding: 15 }}>
                    <Defaults activeTab={props.defaults.activeTab} headerparams={whsParams} />
                </TabPane>
            </TabContent>
        </div>
    )
}

Commissions.defaultProps = {

}

const mapStateToProps = ({ defaults }) => ({ defaults })
export default connect(mapStateToProps)(Commissions)