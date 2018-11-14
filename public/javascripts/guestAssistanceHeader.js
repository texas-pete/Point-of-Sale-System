const socket = io();

socket.on('connect', function() {
    // Connected, let's sign-up for to receive messages for this room

    //service requests
    socket.emit("joinSR");
    //drink requests
    socket.emit("joinDR");
 });

// header button functions
$(document).ready(function(){

    // request assistance btn
    $("#servicerq").click(function(){
        tblNumberString = tblNumber.toString();
        socket.emit("serviceRequest", tblNumberString);  
        alert("Request Sent for Table: " + tblNumberString)
    });


    $(".drink").click(function(){
        let drink = $(this).text().trim();
        let tblNumberString = tblNumber.toString().trim();
        alert(drink + " for table " + tblNumberString );
        let requestMsg = {tableNum: tblNumberString, drink: drink};
        socket.emit("drinkRequest", requestMsg);
    });

    socket.on("updatedSR", function(){
        alert("UPDATED SR");
    })
});
