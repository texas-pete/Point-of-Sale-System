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
        let totalDiv = 0;
        for (let j = 0; j < responseData.length; j++) { //for each query result for table 1

          for (let i = 0; i < responseData[j].orderedItems.length; i++) { //we want to print the contents of 

            if (typeof responseData[j].orderedItems[i].item !== 'undefined') {
              myDiv.insertAdjacentHTML('beforeend', createOrderItem(totalDiv));
              totalDiv++;
            }
            else {

            }
          }
        } //we fill the contents at least

        var submitted_item_names = document.querySelectorAll('.item_name');//now we personalize them
        var submitted_item_descr = document.querySelectorAll('.item_desc');
        var q = 0;
        for (var index = 0; index < responseData.length; index++) {
          for (var index2 = 0; index2 < responseData[index].orderedItems.length; index2++) {

            let id = q;
            $.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
              url: "/getItemName/" + responseData[index].orderedItems[index2].item,
              type: "POST",
              success: function (retVal) { //responseData contains the returned 'name' from our ID



                submitted_item_names[id].innerHTML = retVal; //we know we are only returning a string for a name.
                //anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
              },
              error: function () { //if we can't find the name in our database
                submitted_item_names[id].innerHTML = responseData[index].orderedItems[index2].item;
                //anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
              }
            });
            q++;
          }
        }
        var k = 0;
        for (var index = 0; index < responseData.length; index++) {
          for (var index2 = 0; index2 < responseData[index].orderedItems.length; index2++) {
            if (typeof responseData[index].orderedItems[index2].notes != 'undefined') {
              submitted_item_descr[k].innerHTML = responseData[index].orderedItems[index2].notes;; //for loop starts at 0 and we don't want the null index
              k++;
            }
            else {
              submitted_item_descr[k].innerHTML = "No notes provided";
              k++;
            }
          }
        }

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

// creates buttons for view order tab
function createOrderItem(id) {
  let spnName = '<span class= "item_name" id="item_name' + id + '"> Item: Name</span>'
  let removeBtn = '<button type="button" id="remove' + id + '" onclick="edit_remove(this.id)" class="btn">X</button>'
  let spnDesc = '<span class= "item_desc" id="item_desc' + id + '">Item: Description/Allergies</span>'
  let editBtn = '<button type="button" id="edit' + id + '" onclick="edit_remove(this.id)" class="btn">Edit</button>'

  output = spnName + removeBtn + '<p></p>' + spnDesc + editBtn + '<hr>';

  return output;
}