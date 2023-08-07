import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownItem } from 'reactstrap'

//imports from custom functions
import Fetch from '../Functions/Fetch'

export default function SalespersonFilter(props) {
    const [salesReps, setSalesReps] = useState(null)

    // Fetch Sales reps from API server
    useEffect(() => {
        Fetch('POST', '/commissionSalespersons', null, setSalesReps)
    }, [])

    return (
        (salesReps === null)
            ?
            <div></div>
            :
            <DropdownMenu>
                {Object.values(salesReps.recordset).map((rep, i) =>
                    <DropdownItem key={i} onClick={props.changeRep} value={rep.SalespersonNo}>{rep.SalespersonNo}</DropdownItem>
                )}
            </DropdownMenu>
    )
}