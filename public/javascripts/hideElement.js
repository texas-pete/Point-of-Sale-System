function hideContent(whichDiv) {
  var x = document.getElementById("content"); //CONTENT is the div we wish to hide
  var y = document.getElementById("orderinfo");
  var z = document.getElementById("service");
  var sidebarVal = $('#tblNumber').text()
  if (whichDiv === "content") {
    //we want to hide the orderinfo and service code
    y.style.display = "none";
    z.style.display = "none";
    if ($('#sidebar').hasClass('active')) {
      $('#sidebar').toggleClass('active');
    }

    $('.boxButtonSelected').toggleClass('boxButtonSelected');
    //we want to show the content information
    x.style.display = "block";
  }
  else if (whichDiv === "orderinfo") {
    //we want to hide the content and service code
    x.style.display = "none";
    z.style.display = "none";
    //we want to show the orderinfo information
    y.style.display = "block";


    console.log($('#tblNumber').text());

    $.ajax({
      url: "/getTableOrder/" + sidebarVal,
      type: "POST",
      success: function (responseData) {
        //TODO: maybe include alert that says 'your order has been added. add more and submit in the 'View Order' tab
        //TODO: have to clear notes section for next order
      },
      error: console.error


    });
  }
  else if (whichDiv === "service") {

    //we want to hide the content and orderinfo code
    x.style.display = "none";
    y.style.display = "none";

    //we want to show the content information
    z.style.display = "block";

  }
}


// copy pasted from w3 schools
