"use strict"


const showModal = ({

    title, 
    content

  }) =>{

    $('#modalTitle').text( title )
    $('#modalContent').html( content )
    document.getElementById('modalWindow').style.display = 'block'
}

const hideModal = () =>{
    $('#modalTitle').text( "" )
    $('#modalContent').html( "" )
    document.getElementById('modalWindow').style.display = 'hidden'
}

const userInfo = msg => {
     $('#userInfo').html( msg )
     document.getElementById('userInfoModal').style.display = 'block'
}    


const addModalFeature = function( app ){

    app.addFeature({
        label : 'showModal', 
        method: showModal
    })

    app.ui.addFeature({
        label: 'modal', 
        method: showModal, 
        description: 'displays a modal window'
    })

    app.ui.addFeature({
        label: 'hideModal', 
        method: hideModal
    })
        

    app.ui.addFeature({label : 'userInfo',  method: userInfo})

    return app
}

module.exports = {
    addModalFeature
}
