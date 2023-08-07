function formatDate(date, nodays) {
    var dt = date
    if (nodays) { dt = new Date().setDate(new Date(date).getDate() - nodays) }
    var d = new Date(dt),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function newDate(date, nodays) {
    let d = date
    d = d.setDate(d.getDate() + nodays)
    d = new Date(d)
    var month = (d.getMonth() + 1) - 1,
        day = d.getDate(),
        year = d.getFullYear()
    return new Date(year, month, day)
}

export {
    formatDate,
    newDate
}