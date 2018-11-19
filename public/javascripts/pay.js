
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
});

function calculateTip(){
	console.log('clicked!' + new Date());
    var serviceQual = document.getElementById("serviceQual").value;
    var billAmt = document.getElementById("sumTotal").value;
	var total = (billAmt * serviceQual);
	//round to two decimal places
	total = Math.round(total * 100) / 100;
    //next line allows us to always have two digits after decimal point
	total = total.toFixed(2);
	//Display the tip
    //document.getElementById("totalTip").style.display = "block";
	//document.getElementById("tip").innerHTML = total;
}	  
//click to call function
document.getElementById("calculate").onclick = function() {
  console.log('clicked!' + new Date());
  calculateTip();
};

//for submitting order
$(document).ready(function () {
	$('.btn btn-primary').on('click', sub);
});

function sub() {
	console.log('clicked!' + new Date());
}

document.getElementById("singleSub").onclick = function() {
	console.log('hi');
};


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