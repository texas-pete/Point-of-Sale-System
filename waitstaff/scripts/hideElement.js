function hideContent(whichDiv) {
  var x = document.getElementById("content"); //CONTENT is the div we wish to hide
  var y = document.getElementById("orderinfo");
  var z = document.getElementById("service");

  if(whichDiv === "content")
  {
    //we want to hide the orderinfo and service code
    y.style.display = "none";
    z.style.display = "none";
    if($('#sidebar').hasClass('active'))
    {
      $('#sidebar').toggleClass('active');
    }

    $('.boxButtonSelected').toggleClass('boxButtonSelected');
    //we want to show the content information
    x.style.display = "block";
  }
  else if(whichDiv === "orderinfo")
  {
    //we want to hide the content and service code
    x.style.display = "none";
    z.style.display = "none";

    //we want to show the orderinfo information
    y.style.display = "block";
  }
  else if(whichDiv === "service")
  {

    //we want to hide the content and orderinfo code
    x.style.display = "none";
    y.style.display = "none";

    //we want to show the content information
    z.style.display = "block";
    // var x = document.getElementById("content"); //CONTENT is the div we wish to hide
    // if (x.style.display === "none") {
    //     x.style.display = "block";
    // } else {
    //     x.style.display = "none";
    // }
  }
}


// copy pasted from w3 schools