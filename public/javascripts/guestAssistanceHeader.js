//we are consolidating the content into this file. Rather than multiple event listeners for this one div, we'll do plenty.

var theParent = document.querySelector("#requester"); //this creates a listener for this class.
theParent.addEventListener("click", validateSelection, false); //no idea what false does. don't really care either.

var socket = io();

socket.on('clearServiceRequest', function(id){
    alert(id);
});


function validateSelection(e) //e is the entity which was pressed.
{
    if (e.target !== e.currentTarget) {
        var interactedItem = e.target.id; //saves the ID of the element clicked

        if (interactedItem === "servicerq") {
            // emit a service request event
            tblNumberString = tblNumber.toString();
            socket.emit("serviceRequest", tblNumberString);
            //alert("Hello " + interactedItem);
            
        }
        else if (interactedItem === "drinkrq") {
            alert("Hello " + interactedItem);
        }
    }
    e.stopPropagation();
}