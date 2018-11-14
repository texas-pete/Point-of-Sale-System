const socket = io();

socket.on("connect", function() {
  // Connected, let's sign-up for to receive messages for this room
  socket.emit("joinSR");
});

socket.on("updatedSR", function(){
  alert("UPDATED SR");
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
