import React from 'react'

//Create headers for Data table component
//pass data table information in params
//pass data row from the table to create headers for
export default function CreaterHeaders(params, srow) {
    return (
        Object.keys(srow).map(clmn => {
            let hidden = false
            let width = '50px'
            let format = null
            let align = 'left'
            let events = {
                onClick: (e, column, columnIndex, row, rowIndex) => {
                    // console.log('ColumnIndex:' + columnIndex + ' RowIndex:' + rowIndex)
                    // console.log('SelectedClmn:' + sclmn + ' SelectedRow:' + srow)
                    if (params.id === 'Purchases' || params.id === 'Invoice') {
                        params.ClmnIndex(columnIndex)
                        params.RowIndex(rowIndex)
                    }
                }
            }
            let style = null
            let bgColor = '#1c9294'
            let bgFontColor = 'white'
            let sort = true

            switch (clmn) {
                case 'Key Field':
                    hidden = true
                    break
                case 'LotSerialNo':
                    width = '100px'
                    break
                case 'Inv Date':
                case 'ReceiptDate':
                    width = '60px'
                    align = 'right'
                    format = (cell) => {
                        let dateObj = cell;
                        if (typeof cell !== 'object') {
                            dateObj = new Date(cell);
                        }
                        if (cell == null) {
                            return
                        }
                        //console.log(cell)
                        return `${('0' + (dateObj.getMonth() + 1)).slice(-2)}/${('0' + dateObj.getDate()).slice(-2)}/${dateObj.getFullYear()}`;
                    }
                    break
                case 'Customer Name':
                    width = '200px'
                    break
                case 'Product':
                    width = '80px'
                    break
                case 'Product Description':
                    width = '250px'
                    break
                case 'Whs':
                    width = '30px'
                    break
                case 'Cases':
                    width = '35px'
                    align = 'right'
                    break
                case 'Weight':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(2) }
                    break
                case 'Truck Line':
                case 'Drop Line':
                case 'Del Line':
                case 'Storage Line':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(2) }
                    style = (cell, row, rowIndex, colIndex) => {
                        if (params.rIndex !== undefined && params.cIndex !== undefined) {
                            if (params.rIndex === rowIndex && params.cIndex === colIndex) {
                                return {
                                    backgroundColor: 'lightblue',
                                    width: '60px'
                                }
                            } else {return null }
                        } else { return null }
                    }
                    break
                case 'GP':
                case 'Gross Profit':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(2) }
                    style = (cell) => {
                        if (cell < 0) {
                            return {
                                backgroundColor: 'lightpink',
                                width: '60px'
                            }
                        } else {
                            return { width: '60px' }
                        }
                    }
                    break
                case 'Over Head':
                case 'Act OH':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(2) }
                    style = (cell, row) => {
                        if (row['Over Head'] === row['Act OH']) {
                            return {
                                backgroundColor: '#f2e696',
                                width: '60px'
                            }
                        } else {
                            return { width: '60px' }
                        }
                    }
                    break
                case 'Sell Price':
                case 'Cost Price':
                case 'Profit Lb':
                case 'Act GP Lb':
                case 'PriceLb':
                case 'Price Lb':
                case 'ReleaseCost':
                case 'TallyCost':
                case 'TallyMin':
                case 'Roll Fee':
                case 'GPLB':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(4) }
                    break
                case 'Storage':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(2) }
                    style = (cell, row, rowIndex, colIndex) => {
                        if (row['Days'] > 29 && row['Storage'] == 0) {
                            // console.log(row['Days'], row['Storage'])
                            return {
                                backgroundColor: '#ff6461',
                                width: '60px'
                            }
                        } else if (params.rIndex !== undefined && params.cIndex !== undefined) {
                            if (params.rIndex === rowIndex && params.cIndex === colIndex) {
                                return {
                                    backgroundColor: 'lightblue',
                                    width: '60px'
                                }
                            } else {return null }
                        } else { return null }
                    }
                    break
                case 'Release':
                case 'Tally':
                case 'Truck':
                case 'Other':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(2) }
                    style = (cell, row, rowIndex, colIndex) => {
                        if (params.rIndex !== undefined && params.cIndex !== undefined) {
                            if (params.rIndex === rowIndex && params.cIndex === colIndex) {
                                return {
                                    backgroundColor: 'lightblue',
                                    width: '60px'
                                }
                            } else {return null }
                        } else { return null }
                    }
                    break
                case 'Cost Lb':
                case 'Act Cost Lb':
                    width = '60px'
                    align = 'right'
                    format = (cell) => { return cell.toFixed(4) }
                    style = (cell, row) => {
                        if (row['Cost Lb'] === row['Act Cost Lb']) {
                            return {
                                backgroundColor: 'lightgreen',
                                width: '60px'
                            }
                        } else {
                            return {
                                width: '60px'
                            }
                        }
                    }
                    break
                case 'PO Ver\'d':
                case 'Inv Ver\'d':
                case 'Del Dtbn':
                    align = 'center'
                    width = '30px'
                    sort = true
                    break
                case 'Rep':
                case 'Seq':
                case 'HSeq':
                case 'DSeq':
                case 'Days':
                    width = '30px'
                    break
                default:
                    break
            }
            if (clmn.includes('Ver\'d') || clmn === 'Del Dtbn') {
                format = (cell) => <input type="checkbox" checked={cell} readOnly />
            }

            let clmnProp = {
                dataField: clmn,
                text: clmn,
                sort: sort,
                headerStyle: { backgroundColor: bgColor, width: width, color: bgFontColor },
                hidden: hidden,
                formatter: format,
                align: align,
                events: events,
                style: (style === null) ? { width: width } : style
                // style: (cell, row, rowIndex, colIndex) => {
                //     if (params.rIndex && params.cIndex) {
                //         // console.log('Selected Row Index:' + params.rIndex + 'Selected Column Index:' + params.cIndex)
                //         // console.log('Current Row Index:' + rowIndex + 'Current Column Index' + colIndex)
                //         if (params.rIndex === rowIndex && params.cIndex === colIndex) {
                //             return {
                //                 backgroundColor: 'lightgreen',
                //                 width: '60px'
                //             }
                //         }
                //     } else {
                //         if (style === null) {
                //             return {
                //                 width: width
                //             }
                //         } else {
                //             return style
                //         }
                //     }
                // }
            }
            // console.log(clmnProp)

            return (
                clmnProp
            )
        })
    )
}