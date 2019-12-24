"use strict"


const dataExchangeStatus = (function(){
    let dataLoading = false
    return{
        setLoading: function(){
            dataLoading = true
            document.getElementById('loadingIndicator').style.display='block'
        },
        setInactive: function(){
            dataLoading = false
            document.getElementById('loadingIndicator').style.display='none'
        }
    }
})()

module.exports = {
    dataExchangeStatus
}