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
        app.features.add({featureName: 'modal', onOff: true})
    }
}

module.exports = {
    addModalFeature
}
