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
    app.addFeature({label : 'showModal', method: showModal})
    return app
}

module.exports = {
    addModalFeature
}
