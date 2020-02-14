"use strict"


const showModal = ({

    title, 
    content

  }) =>{

    $('#modalTitle').text( title )
    $('#modalContent').html( content )
    document.getElementById('modalWindow').style.display = 'block'
}

const addModalFeature = function( ui ){

    ui.features.modal = true
    ui.showModal = showModal
}

module.exports = {
    addModalFeature
}
