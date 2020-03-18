"use strict"


const showModal = ({

    title, 
    content

  }) =>{

    $('#modalTitle').text( title )
    $('#modalContent').html( content )
    document.getElementById('modalWindow').style.display = 'block'
}

const userInfo = msg => {
     $('#userInfo').html( msg )
     document.getElementById('userInfoModal').style.display = 'block'
}    


const addModalFeature = function( app ){

    app.addFeature({label : 'showModal', method: showModal})
    app.ui.addFeature({label : 'userInfo',  method: userInfo})

    return app
}

module.exports = {
    addModalFeature
}
