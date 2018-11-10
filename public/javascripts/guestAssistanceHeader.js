//we are consolidating the content into this file. Rather than multiple event listeners for this one div, we'll do plenty.

var theParent = document.querySelector("#requester"); //this creates a listener for this class.
theParent.addEventListener("click", validateSelection, false); //no idea what false does. don't really care either.

function validateSelection(e) //e is the entity which was pressed.
{
    if (e.target !== e.currentTarget) {
        var interactedItem = e.target.id; //saves the ID of the element clicked

        if (interactedItem === "servicerq") {
            alert("Hello " + interactedItem);
        }
        else if (interactedItem === "drinkrq") {
            alert("Hello " + interactedItem);
        }
    }
    e.stopPropagation();
}