const socket = io();

var arr;
socket.on("connect", function() {
  // Connected, let's sign-up for to receive messages for this room
  socket.emit("joinSR");
});

// update the screen to change the color of tables with service requests
// srUpdate events send an array of tableNumber for the tables with requests
socket.on("srUpdate", function(requestsArray){
  let idPrefix = '#box';
  let i = 0;
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

// applies functionality for table buttons to all table buttons
$(document).ready(function () {
  
  $('#clearServiceRequest').click(clearReq);


  // boxButton onClick
  // handles clicking on tables
  $(".boxButton").click(function () {

    // table number of button being pressed
    var btnTblNum = $(this).first().text();
    // table number on sidebar
    var sidebarTblNum = $("#tblNumber").text();

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

// clear the service request for the current table
function clearReq() {

  //get table number
  table = $('#tblNumber').text().trim();

  // let the server know to clear the request
  socket.emit("clearServiceRequest",table);
}
