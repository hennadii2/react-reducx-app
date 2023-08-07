import React from 'react'
import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames'

export default function Tabs(props) {
    return (
        <Nav tabs>
            <NavItem>
                <NavLink
                    className={classnames({ active: props.activeTab === '1' })}
                    onClick={() => { props.toggle('1') }}
                >
                    Receipts
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink
                    className={classnames({ active: props.activeTab === '2' })}
                    onClick={() => { props.toggle('2') }}
                >
                    Invoices
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink
                    className={classnames({ active: props.activeTab === '3' })}
                    onClick={() => { props.toggle('3') }}
                >
                    Warehouse Defaults
                </NavLink>
            </NavItem>
        </Nav>
    )
}