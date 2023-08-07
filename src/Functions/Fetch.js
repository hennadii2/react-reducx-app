import { baseURL } from '../Config'

//fetch data from API server
export default async function Fetch(method, proc, params, response) {
    let options = null
    let url = baseURL + proc
    switch (method) {
        case 'POST':
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            }
            break
        default:
            options = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
            break
    }
    fetch(url, options)
        .then(result => result.json())
        .then(data => {
            if (process.env.NODE_ENV === 'development') {
                //console.log(data)
            }
            response(data)
        })
}