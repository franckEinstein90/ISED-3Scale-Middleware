"use strict"; 

const errors = (function(){

	return{
		AppError: class extends Error{
				constructor(args){
					super(args)
					this.name = "ISEDMidWare Error"
			}
		},
		errorHandler: function(err){
			console.log('went to error handler')
		}
	}
	
})() 


module.exports = {
	errors
}
