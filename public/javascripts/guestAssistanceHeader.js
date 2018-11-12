
var socket = io();
// socket.on('clearServiceRequest', function(){
//     alert(tblNumber);
// });


$(document).ready(function(){
    $("#servicerq").click(function(){
        tblNumberString = tblNumber.toString();
        socket.emit("serviceRequest", tblNumberString);  
        alert("Request Sent")
    });

    $("#drinkrq").click(function(){
        alert("Hello ");
    });
});
