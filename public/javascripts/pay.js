/*const socket = io();//MIGHT NEED

socket.on('connect', function() {
    // Connected, let's sign-up for to receive messages for this room

    //service requests
    socket.emit("joinSR");
    //drink requests
    socket.emit("joinDR");
 });*/
  
  /*$(document).ready(() => {
	  $('#calculate').click(() => {
		  console.log('clicked!' + new Date());
		  $.ajax({
			  url: 'guest-pay/',
			  type: 'GET',
			  dataType: '',
			  success: (data) => {
				  console.log('ajax success!', data);
				  location.reload();
			  }
		  });
	  });
  });

$(document).ready(() => {
	$('#calculate').click(() => {
		console.log('clicked!' + new Date());
		$.ajax({
			url: 'guest-pay/',
			type: 'GET',
			dataType: '',
			success: (data) => {
				console.log('ajax success!', data);
				location.reload();
			}
		});
	});
});*/

function calculateTip(){
	var serviceQual = document.getElementById("serviceQual").value;
	console.log(serviceQual);
	var billAmt = document.getElementById("singlePayTotal").innerText;
	console.log(billAmt);
	var tax = parseFloat(billAmt * 0.0825).toFixed(2);
	console.log(tax);
	//tax = Math.round(0.0825 * billAmt);
	var total = (parseFloat(billAmt) * serviceQual);
	//round to two decimal places
	total = Math.round(total * 100) / 100;
    //next line allows us to always have two digits after decimal point
	total = total.toFixed(2);
	var overallTot = parseFloat(total) + parseFloat(tax) + parseFloat(billAmt);
	overallTot = overallTot.toFixed(2);
	//Display the tip
    document.getElementById("totalTip").innerHTML = total;
	document.getElementById("overallTotal").innerHTML = overallTot;
}	  
//click to call function
document.getElementById("calculate").onclick = function() {
  calculateTip();
};


$("#singleSub").click(function () {
	var total = document.getElementById("overallTotal").innerHTML;
	var tax = 	document.getElementById("totTax").innerHTML;
	var tips = document.getElementById("totalTip").innerHTML;
	console.log(total)
	console.log(tax)
	console.log(tips)



	$.ajax({ //there is a way to do this via $.post("/getTableOrder/" + sidebarVal) but keeping ajax as such
		url: "/guest-pay/submit/" + tax + '/' + total + '/' + tips+ '/',
		type: "POST",
		success: function (retVal) { //responseData contains the returned 'name' from our ID

		console.log("PS");

		//we know we are only returning a string for a name.
		//anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
		},
		error: function () { //if we can't find the name in our database
			console.log("FAIL");
		//anytime we insert a value, we have to increment the q value because there are only q slots avaialble to store names.
		}
	});

});















//for submitting order
//$(document).ready(function () {
//	$('.btn btn-primary').on('click', sub);
//});

//function sub() {
//	console.log('clicked!' + new Date());
//}

//document.getElementById("singleSub").onclick = function() {
//	console.log('hi')
//};


// //opens a modal to add to order and make any changes or note any allergies
// function addToOrder() {
// 	console.log($(this).data('id'))
// 	var objId = $(this).data('id')
// 	document.querySelector('.bg-modal').style.display = 'flex';
// 	$.ajax({
// 		url: "/getMenuItemById/" + $(this).data('id'),
// 		type: "POST",
// 		success: function (responseData) {
// 			console.log(responseData[0].Name);
// 			document.querySelector('.modal-menu-name').innerHTML = responseData[0].Name;
// 			document.querySelector('.modal-menu-img').src = 'http://localhost:3000/images/' + responseData[0].ImageName;
// 			document.querySelector('.modal-menu-img').alt = responseData[0].Name;
// 			document.querySelector('.modal-menu-price').innerHTML = '$' + responseData[0].Price;
			

// 			document.querySelector('.modal-menu-desc').innerHTML = responseData[0].Description;
// 			//sets the modal's submit button to contain objId information
// 			var id = document.querySelector('.modal-submit');
// 			console.log("Attribute is set as " + objId);
// 			id.setAttribute('data-id', objId);
// 			//console.log(document.querySelector('.modal-submit').data-id);
// 		},
// 		error: console.error
// 	});
// }

// //for submitting order
// $(document).ready(function () {
// 	$('.modal-submit').on('click', submitToOrder);
// });


// function submitToOrder() {
// 	//store objID in variable for ease-of-use and scope 
// 	var objId = $(this).data('id');
// 	var notes = document.getElementsByName('notes')[0].value;
// 	var price = document.getElementsByClassName('modal-menu-price')[0].innerHTML.replace("$", "");
// 	console.log("Sending in the price of: " + price);
// 	if (!notes.replace(/\s/g, '').length) {
// 		notes = "empty"
// 	}
// 	console.log("Attempting to submit order " + objId + " and notes as " + notes);
// 	//hide modal
// 	document.querySelector('.bg-modal').style.display = 'none';

// 	$.ajax({
// 		url: "/submitToOrder/" + objId + "/" + notes + "/" + price,
// 		type: "POST",
// 		success: function (responseData) {
// 			alert("Your order has been added. View and submit complete order in the 'View Order' tab.");
// 			document.querySelector('.clear-this').value = '';
// 		},
// 		error: console.error
// 	});
// }