const socket = io();

// stores all drink request info
var drinksArray;

socket.on("connect", function() {
  // Connected, let's sign-up for to receive messages for this room
  
  //service requests
  socket.emit("joinSR");
  //drink requests
  socket.emit("joinDR");
});


// update the screen to change the color of tables with service requests
// srUpdate events send an array of tableNumber for the tables with requests
socket.on("srUpdate", function(requestsArray){
  let idPrefix = '#box';
// table divs have ID's of the following form: 'box0' 'box1' ... etc

  // turn off all indicators
  $(".boxServiceRequested").toggleClass("boxServiceRequested");

  // turn on the ones that still have requests
  requestsArray.forEach(element => {
    // #box + tableNumber
    let currentBoxID = idPrefix + element["tableNum"];
    // select that ID and add the boxServiceRequested class
    $(currentBoxID).toggleClass("boxServiceRequested")
  });
})

socket.on("drUpdate", function(drinks){
  // copy over new drinks array
  drinksArray = drinks;

  // render sidebar
  renderDrinks($("#tblNumber").text().trim());

  let idPrefix = '#box';
  // table divs have ID's of the following form: 'box0' 'box1' ... etc

  // turn off all indicators
  $(".boxDrinkRequested").toggleClass("boxDrinkRequested");

  // turn on the ones that still have drink requests
  drinksArray.forEach(element => {
    // #box + tableNumber
    let currentBoxID = idPrefix + element["tableNum"];
    console.log(currentBoxID)
    // select that ID and add the boxServiceRequested class
    $(currentBoxID).toggleClass("boxDrinkRequested")
  });

})

// applies functionality for table buttons to all table buttons
$(document).ready(function () {
  
  // clear service requests
  $('#clearServiceRequest').click(clearReq);

  $('#clearRefills').click(clearRefills);

  // boxButton onClick
  // handles clicking on tables
  $(".boxButton").click(function () {

    // table number of button being pressed
    var btnTblNum = $(this).first().text().trim();
    // table number on sidebar
    var sidebarTblNum = $("#tblNumber").text().trim();

    // generate the drinks list in the sidebar
    renderDrinks(btnTblNum);

    // show/hide sidebar 
    if ($("#sidebar").hasClass("active")) {
      // if table is already on screen, hide sidebar
      if (btnTblNum === sidebarTblNum) {
        $("#sidebar").toggleClass("active");
        $(this).toggleClass("boxButtonSelected");
      } else { //else, put new info in sidebar
        $(".boxButtonSelected").toggleClass("boxButtonSelected");
        $("#tblNumber").text(btnTblNum);
        $(this).toggleClass("boxButtonSelected");
      }
    } else { //else, put new number and show
      $("#tblNumber").text(btnTblNum);
      $("#sidebar").toggleClass("active");
      $(this).toggleClass("boxButtonSelected");
    }

  });

});


function renderDrinks(tblNum) {
  let outputList = "";
  
  // if the drink request is for the current table,
  // add it to the list of drink requests
  drinksArray.forEach(element => {
    if(element["tableNum"] === tblNum){
      outputList += ( "<li>" + element["drink"] + "</li>");
    }
  });

  // filler text for no requests
  if (outputList === ""){
    outputList = "No Drink Requests";
  }

  // put it in the page
  $("#refillsList").html(outputList);
};


// clear the service request for the current table
function clearReq() {

  //get table number
  table = $('#tblNumber').text().trim();

  // let the server know to clear the request
  socket.emit("clearServiceRequest",table);
}


// clear the drink request for the current table
function clearRefills() {

  //get table number
  table = $('#tblNumber').text().trim();

  // let the server know to clear the request
  socket.emit("clearDrinkRequest",table);
}
