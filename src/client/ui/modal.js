"use strict"


const showModal = ({

    title, 
    content

  }) =>{

    $('#modalTitle').text( title )
    $('#modalContent').html( content )
    document.getElementById('modalWindow').style.display = 'block'
}

const addModalFeature = function( app ){
    if(app.features.includes('ui')){
        app.ui.showModal = showModal
        app.addFeature({label : 'modal', state: 'implemented'})
    }
}

module.exports = {
    addModalFeature
}
