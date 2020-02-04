/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  appStatusDialog.js: information and actions on app variables
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/
const appStatusDialog = (function(){

	let _initUI = function(){
		$('#btnRefreshTenants').click(function ( event ){
			event.preventDefault()
			$.get('/refreshTenants', {}, function(data) {
				debugger	
			})
		})
		$('#appStatus').click(function( event ) {
			this.classList.toggle("active")
			let statusDetailPaneHeight = $('#appStatusDetail').css('maxHeight')	
			if( statusDetailPaneHeight === '0px' ){
				let scrollHeight = $('#appStatusDetail').css('scrollHeight')
				$('#appStatusDetail').css('maxHeight', '80px')
			} else {
				$('#appStatusDetail').css('maxHeight', '0px')
			}
		})
	}
	return {
        ready: function(){
				_initUI()
		  }, 
		  update: function(){

		  }
    }
})()

module.exports = {
    appStatusDialog
}
