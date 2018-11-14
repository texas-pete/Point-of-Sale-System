function hideContent(whichDiv) {
  var x = document.getElementById("content"); //CONTENT is the div we wish to hide
  var y = document.getElementById("orderinfo");
  var z = document.getElementById("service");
  var sidebarVal = $('#tblNumber').text()

  //we need to wipe the contents of our divs before we start. This way the button can't keep replicating the same order.
  var myDiv = document.getElementById("entities");
  if (document.contains(myDiv)) {
    myDiv.remove();
    //then insert an empty div
    var ele = document.createElement("div"); //creates a div 
    ele.setAttribute("id", "entities");
    document.getElementById("orderinfo").appendChild(ele); //now we want to put it inside of orederinfo
    myDiv = document.getElementById("entities")
  }

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

    for (let i = 0; i < 16; i++) //hacky way to fix the input received from the table number
    {
      if (i + 1 == sidebarVal) {
        sidebarVal = (i + 1);
        break; //There is no reason to continue looping if we have fixed our variable
      }
    }
    $.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
      url: "/getTableOrder/" + sidebarVal,
      type: "POST",
      success: function (responseData) { //upon a successful post, we run below code.

        for (let i = 0; i < responseData[0].items.length; i++) { //loop through the number of ITEMs ordered

          if (typeof responseData[0].items[i].item !== 'undefined') { //if the name of an item is undefined, omit it.
            myDiv.insertAdjacentHTML('beforeend', ' <span class= "item_name"> Item: Name</span > <button type="button" id="remove" onclick="edit_remove(this.id)" class="btn">X</button><p></p><span class= "item_desc" >Item: Description/Allergies</span><button type="button" id="edit" onclick="edit_remove(this.id)" class="btn">Edit</button><hr>');
          }
        }
        var submitted_item_names = document.querySelectorAll('.item_name'); //stores all instances of this class into an array
        var submitted_item_descr = document.querySelectorAll('.item_desc');

        submitted_item_names.forEach(function (userItem, index) {

          $.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
            url: "/getItemName/" + responseData[0].items[index].item,
            type: "POST",
            success: function (responseData) { //responseData contains the returned 'name' from our ID
              userItem.innerHTML = responseData;
            },
            error: function () { //if we can't find the name in our database
              userItem.innerHTML = responseData[0].items[index].item;
            }
          });
        });
        submitted_item_descr.forEach(function (userItem, index) {
          if (typeof responseData[0].items[index].notes != 'undefined') {
            userItem.innerHTML = responseData[0].items[index].notes; //for loop starts at 0 and we don't want the null index
          }
          else {
            userItem.innerHTML = "No notes provided";
          }
        });
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
