const socket = io();

socket.on('connect', function() {
    // Connected, let's sign-up for to receive messages for this room
    socket.emit('joinSR');
 });

// header button functions
$(document).ready(function(){

    // request assistance btn
    $("#servicerq").click(function(){
        tblNumberString = tblNumber.toString();
        socket.emit("serviceRequest", tblNumberString);  
        alert("Request Sent for Table: " + tblNumberString)
    });

    socket.on("updatedSR", function(){
        alert("UPDATED SR");
    })
});
